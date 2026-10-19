import { NextResponse } from "next/server";

// Nearest-mosque lookup — keyless OpenStreetMap data via the Overpass API.
// Runs server-side (Overpass needs an Accept header + a polite User-Agent and
// has no reliable browser CORS story), normalises nodes AND ways (ways only
// expose a centroid through `out center`), and sorts by real distance so the
// client never has to guess what "nearest" means.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

// Widening search rings — a village may have nothing within 2.5 km.
const RADII = [2500, 8000];
// Overpass `out` has no distance ordering, so ask for far more than we show
// and sort by real distance ourselves.
const FETCH_LIMIT = 400;
const MAX_RESULTS = 40;
const TOTAL_BUDGET_MS = 26000;

interface RawElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function buildQuery(lat: number, lon: number, radius: number): string {
  return `[out:json][timeout:20];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
  node["building"="mosque"](around:${radius},${lat},${lon});
  way["building"="mosque"](around:${radius},${lat},${lon});
);
out center ${FETCH_LIMIT};`;
}

/**
 * Overpass instances are load-balanced and a single one can sit at capacity
 * for minutes, so race them in parallel. The first mirror that returns actual
 * data wins and the rest are aborted — one shared budget instead of three
 * sequential timeouts, which would blow the lambda.
 *
 * "Empty" is deliberately NOT a win: regional mirrors (osm.ch) answer in a
 * second but only cover their own country. We only treat an empty result as
 * the truth once every mirror has failed or answered empty.
 */
async function runOverpass(query: string, timeoutMs: number): Promise<RawElement[]> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);

  return await new Promise<RawElement[]>((resolve, reject) => {
    let pending = ENDPOINTS.length;
    let emptySeen = false;
    let settled = false;

    const finish = (value: RawElement[]) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      ctl.abort();
      resolve(value);
    };

    const fail = () => {
      if (settled) return;
      pending -= 1;
      if (pending > 0) return;
      settled = true;
      clearTimeout(timer);
      ctl.abort();
      if (emptySeen) resolve([]);
      else reject(new Error("overpass unavailable"));
    };

    for (const url of ENDPOINTS) {
      (async () => {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
              "User-Agent": "islah-web/1.0 (+https://islahbd.com)",
            },
            body: "data=" + encodeURIComponent(query),
            cache: "no-store",
            signal: ctl.signal,
          });
          if (!res.ok) throw new Error(`overpass ${res.status}`);
          const json = (await res.json()) as { elements?: RawElement[] };
          const elements = json.elements ?? [];
          if (elements.length === 0) {
            emptySeen = true;
            fail();
          } else {
            finish(elements);
          }
        } catch {
          fail();
        }
      })();
    }
  });
}

function normalize(el: RawElement, lat: number, lon: number) {
  const tags = el.tags ?? {};
  const elLat = el.lat ?? el.center?.lat;
  const elLon = el.lon ?? el.center?.lon;
  if (!Number.isFinite(elLat) || !Number.isFinite(elLon)) return null;

  const name =
    tags.name || tags["name:bn"] || tags["name:en"] || tags["name:ar"] || "মসজিদ";
  const address = [tags["addr:street"], tags["addr:suburb"], tags["addr:city"]]
    .filter(Boolean)
    .join(", ");

  return {
    id: `${el.type}/${el.id}`,
    name,
    lat: elLat as number,
    lon: elLon as number,
    distance: Math.round(distanceMeters(lat, lon, elLat as number, elLon as number)),
    address,
    phone: tags.phone || tags["contact:phone"] || "",
    hours: tags.opening_hours || "",
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latRaw = searchParams.get("lat");
  const lonRaw = searchParams.get("lon");
  const lat = Number(latRaw);
  const lon = Number(lonRaw);

  if (
    latRaw === null ||
    lonRaw === null ||
    latRaw === "" ||
    lonRaw === "" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  ) {
    return NextResponse.json({ success: false, error: "সঠিক লোকেশন দরকার।" }, { status: 400 });
  }

  try {
    let elements: RawElement[] = [];
    let radius = RADII[0];
    const deadline = Date.now() + TOTAL_BUDGET_MS;

    for (const r of RADII) {
      const remaining = deadline - Date.now();
      // Don't start a ring we can't finish — better a partial answer than a
      // gateway timeout.
      if (remaining < 5000) break;
      radius = r;
      elements = await runOverpass(buildQuery(lat, lon, r), Math.min(remaining, 24000));
      if (elements.length > 0) break;
    }

    if (elements.length === 0) {
      return NextResponse.json(
        { success: false, error: "আশেপাশে মসজিদের তথ্য পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const seen = new Set<string>();
    const sorted = elements
      .map((el) => normalize(el, lat, lon))
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      })
      .sort((a, b) => a.distance - b.distance);

    // OSM often maps one physical masjid twice (a node + a building way).
    // Collapse same-name entries within ~150 m so the list doesn't repeat.
    const results: typeof sorted = [];
    for (const m of sorted) {
      const dupe = results.some(
        (k) =>
          k.name.toLowerCase() === m.name.toLowerCase() &&
          Math.abs(k.distance - m.distance) < 150
      );
      if (!dupe) results.push(m);
      if (results.length >= MAX_RESULTS) break;
    }

    return NextResponse.json(
      { success: true, lat, lon, radius, count: results.length, results },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "মসজিদের তথ্য এখন পাওয়া যাচ্ছে না।" },
      { status: 502 }
    );
  }
}
