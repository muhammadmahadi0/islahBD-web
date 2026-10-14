import { NextResponse } from "next/server";

// Aladhan timings proxy (method=1 Karachi, school=1 Hanafi):
// /api/prayer?lat=23.81&lng=90.41&date=14-10-2026
export const revalidate = 3600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat")) || 23.8103;
  const lng = Number(searchParams.get("lng")) || 90.4125;
  const d = new Date();
  const date = searchParams.get("date") || `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=1&school=1`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.code !== 200 || !data.data) throw new Error("bad payload");
    const t = data.data.timings;
    const clean = (s: string) => String(s || "").slice(0, 5);
    const h = data.data.date?.hijri;
    return NextResponse.json({
      success: true,
      times: {
        fajr: clean(t.Fajr), sunrise: clean(t.Sunrise), dhuhr: clean(t.Dhuhr),
        asr: clean(t.Asr), maghrib: clean(t.Maghrib), isha: clean(t.Isha),
        sunset: clean(t.Sunset),
      },
      hijri: h ? { day: h.day, monthNum: h.month?.number || 0, monthEn: h.month?.en || "", year: h.year } : null,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Aladhan unreachable" }, { status: 502 });
  }
}
