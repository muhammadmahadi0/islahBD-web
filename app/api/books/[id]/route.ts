import { NextResponse } from "next/server";
import { fetchReaderBook } from "../../../../lib/islamijindegi";

// On-demand book reader data. Cached for a day; chapter HTML rarely changes.
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const book = await fetchReaderBook(params.id);
    return NextResponse.json(
      { success: true, book },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "কিতাবের লেখা লোড করা যাচ্ছে না।" },
      { status: 502 }
    );
  }
}
