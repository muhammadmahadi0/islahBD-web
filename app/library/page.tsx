"use client";
import { useEffect, useState } from "react";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.islahbd.com/api/books/")
      .then((r) => r.json())
      .then((d) => setBooks(Array.isArray(d) ? d : d.results || []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  const list = books
    .filter((b: any) => !submitted.trim() || JSON.stringify(b).toLowerCase().includes(submitted.toLowerCase()))
    .slice(0, 60);

  return (
    <div className="animate-fade-up">
      <PageHead title="লাইব্রেরি" subtitle="ইসলামি বই পড়ুন ও ডাউনলোড করুন" icon="library" />
      <form className="relative mt-3" onSubmit={(e) => { e.preventDefault(); setSubmitted(q); }}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="বই খুঁজুন…" className="input !pl-11 !shadow-card" />
      </form>
      {loading ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="h-4 w-3/4 rounded-full bg-sand-dark" />
              <div className="mt-2 h-3 w-1/2 rounded-full bg-sand-dark" />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-3">
          <EmptyState icon="library" title="বই পাওয়া যায়নি" hint="islahbd.com-এ আরও বই দেখুন" />
        </div>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {list.map((b: any, i: number) => (
            <div key={i} className="card card-hover flex gap-3 p-4">
              <span className="icon-tile shrink-0 bg-orange-50 text-orange-500">
                <Icon name="book" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold leading-snug">{b.title || b.name || `বই ${i + 1}`}</div>
                <div className="truncate text-xs text-ink-faint">{b.author || b.category || ""}</div>
                {b.pdf && (
                  <div className="mt-2 flex gap-1.5">
                    <a href={b.pdf} target="_blank" rel="noreferrer" className="btn-primary flex-1 !py-1.5 !text-xs">
                      পড়ুন
                    </a>
                    <a href={b.pdf} download aria-label="download" className="btn-ghost !rounded-xl !p-1.5">
                      <Icon name="download" size={16} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
