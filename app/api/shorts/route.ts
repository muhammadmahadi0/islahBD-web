import { NextResponse } from "next/server";
import { getShortClips } from "../../../lib/shorts";

// Proxies the keyless IslahBD clips API with ISR caching (same pattern as
// /api/boyan and /api/hamdnaat).
export const revalidate = 300;

export async function GET() {
  try {
    const clips = await getShortClips();
    return NextResponse.json({ success: true, clips, source: "islahbd" });
  } catch {
    return NextResponse.json(
      { success: false, error: "ক্লিপ তালিকা লোড করা যাচ্ছে না।" },
      { status: 502 }
    );
  }
}
