"use client";
import { useEffect } from "react";

// Route-level crash screen (Bengali) — replaces Next.js's white
// "application error" page when a section throws on tap/render.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route-error]", error);
  }, [error]);

  return (
    <div className="card mx-auto mt-6 max-w-sm p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gold-light text-2xl font-bold text-gold-dark">
        !
      </div>
      <h2 className="mt-3 text-lg font-bold">কিছু একটা সমস্যা হয়েছে</h2>
      <p className="mt-1 text-sm text-ink-faint">
        দুঃখিত — এই অংশটি লোড করা যায়নি। আবার চেষ্টা করুন।
      </p>
      <button onClick={() => reset()} className="btn-primary mt-4 w-full">
        আবার চেষ্টা করুন
      </button>
      <a href="/" className="btn-ghost mt-2 block w-full">
        হোমে ফিরুন
      </a>
    </div>
  );
}
