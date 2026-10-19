/**
 * Server-side short-clips catalog (`api.islahbd.com/api/clips/`).
 *
 * ~194 items: `audio` clips carry a direct MP3 (stream engine) and `video`
 * clips carry a `youtubeId` (YouTube engine). Keyless, no pagination — fetch
 * the whole list once and filter client-side.
 *
 * The upstream API stores the bare YouTube ID in `title` for most video
 * clips, so real titles are resolved from YouTube's keyless oEmbed endpoint
 * and a committed snapshot (`shorts-titles.json`).
 */
import type { ShortClip } from "./shorts";
import titleSnapshot from "./shorts-titles.json";

const CLIPS_URL = "https://api.islahbd.com/api/clips/";
const OEMBED_URL = "https://www.youtube.com/oembed";
const FETCH_TIMEOUT_MS = 10000;
const OEMBED_TIMEOUT_MS = 5000;
const UNTITLED = "শিরোনামহীন ক্লিপ";
const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** Real YouTube titles captured from oEmbed for the current catalog. */
const KNOWN_TITLES = titleSnapshot as Record<string, string>;

/** The clips API mixes bare IDs and full watch URLs in `youtubeId`. */
function normalizeYouTubeId(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value) return "";
  if (YOUTUBE_ID_RE.test(value)) return value;

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    if (url.hostname === "youtu.be" || url.hostname.endsWith(".youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0] || "";
      return YOUTUBE_ID_RE.test(id) ? id : "";
    }
    const v = url.searchParams.get("v");
    if (v && YOUTUBE_ID_RE.test(v)) return v;
    const match = url.pathname.match(/\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
  } catch {
    // Not a URL — fall through to a loose ID match.
  }

  const loose = value.match(/([A-Za-z0-9_-]{11})/);
  return loose ? loose[1] : "";
}

/** A title is unusable when it is empty or is just the video ID. */
function isPlaceholderTitle(title: string, youtubeId: string): boolean {
  const value = title.trim();
  return !value || value === youtubeId || YOUTUBE_ID_RE.test(value);
}

const titleCache = new Map<string, string>();

/** Resolve a future/unknown clip's title without an API key. */
async function fetchYouTubeTitle(id: string): Promise<string | null> {
  const cached = titleCache.get(id);
  if (cached) return cached;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OEMBED_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${OEMBED_URL}?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
      { signal: controller.signal, headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: unknown };
    const title = typeof data.title === "string" ? data.title.trim() : "";
    if (!title) return null;
    titleCache.set(id, title);
    return title;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function sanitizeClip(item: any): ShortClip | null {
  if (!item) return null;
  const audioUrl = typeof item.audioUrl === "string" ? item.audioUrl.trim() : "";
  const youtubeId = normalizeYouTubeId(item.youtubeId);
  const apiTitle = typeof item.title === "string" ? item.title.trim() : "";
  const createdAt = typeof item.createdAt === "string" ? item.createdAt : "";

  // Video clips ride the YouTube embed; audio clips ride the stream engine.
  if (youtubeId) {
    const title =
      KNOWN_TITLES[youtubeId] ||
      (isPlaceholderTitle(apiTitle, youtubeId) ? UNTITLED : apiTitle);
    return {
      id: Number(item.id) || 0,
      title,
      type: "video",
      audioUrl: "",
      youtubeId,
      createdAt,
    };
  }
  if (!audioUrl) return null;
  return {
    id: Number(item.id) || 0,
    title: apiTitle || UNTITLED,
    type: "audio",
    audioUrl,
    youtubeId: "",
    createdAt,
  };
}

/** Whole catalog, newest first. */
export async function getShortClips(): Promise<ShortClip[]> {
  const data = await fetchJson<any[]>(CLIPS_URL);
  if (!Array.isArray(data)) return [];
  const clips = data
    .map(sanitizeClip)
    .filter((c): c is ShortClip => c !== null);

  // Clips added after the title snapshot fall back to YouTube's keyless
  // oEmbed (cached in-process). If it fails, the neutral title remains.
  const unresolved = clips.filter(
    (c) => c.type === "video" && c.title === UNTITLED && !KNOWN_TITLES[c.youtubeId]
  );
  for (let i = 0; i < unresolved.length; i += 6) {
    await Promise.all(
      unresolved.slice(i, i + 6).map(async (clip) => {
        const title = await fetchYouTubeTitle(clip.youtubeId);
        if (title) clip.title = title;
      })
    );
  }

  return clips.sort((a, b) => b.id - a.id);
}
