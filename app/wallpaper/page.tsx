import Link from "next/link";
export default function WallpaperRedirect() {
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">🌄 ওয়ালপেপার</h1>
      <Link href="/gallery" className="btn-primary block text-center mt-3">গ্যালারি পেজে ওয়ালপেপার দেখুন →</Link>
    </div>
  );
}
