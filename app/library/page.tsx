"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { bnNum } from "../../lib/audio";

// Books — IslahBD catalog + the full Islami Jindegi kitab collection
// (public/data/islamijindegi-books.json, scraped from
// islamijindegi.com/bn/books). Search, category filter, PDF read/download.
interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  cover: string;
  pdf: string;
  source: "islahbd" | "islamijindegi";
}

const PAGE_SIZE = 48;
const ALL = "সব";

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [cat, setCat] = useState(ALL);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [islah, jindegi] = await Promise.allSettled([
      fetch("/api/books").then((r) => r.json()),
      fetch("/data/islamijindegi-books.json").then((r) => r.json()),
    ]);

    const merged: Book[] = [];
    if (islah.status === "fulfilled" && islah.value?.success) {
      for (const b of islah.value.books as Omit<Book, "source">[]) {
        merged.push({ ...b, source: "islahbd" });
      }
    }
    if (jindegi.status === "fulfilled" && Array.isArray(jindegi.value)) {
      for (const b of jindegi.value as Omit<Book, "source">[]) {
        merged.push({ ...b, source: "islamijindegi" });
      }
    }
    setBooks(merged);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of books) {
      if (b.category) counts.set(b.category, (counts.get(b.category) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [books]);

  const filtered = useMemo(() => {
    const term = submitted.trim().toLowerCase();
    return books.filter((b) => {
      if (cat !== ALL && b.category !== cat) return false;
      if (!term) return true;
      return `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(term);
    });
  }, [books, submitted, cat]);

  const list = filtered.slice(0, visible);

  return (
    <div className="animate-fade-up">
      <PageHead
        title="লাইব্রেরি"
        subtitle={`ইসলামি বই পড়ুন ও ডাউনলোড করুন${books.length ? ` • ${bnNum(books.length)}টি` : ""}`}
        icon="library"
      />

      <form
        className="relative mt-3"
        onSubmit={(e) => { e.preventDefault(); setSubmitted(q); setVisible(PAGE_SIZE); }}
      >
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="বই বা লেখকের নাম খুঁজুন…"
          className="input !pl-11 !shadow-card"
        />
      </form>

      {categories.length > 0 && (
        <div className="rail -mx-3 flex gap-2 overflow-x-auto px-3 py-3">
          <button
            onClick={() => { setCat(ALL); setVisible(PAGE_SIZE); }}
            className={`chip shrink-0 !px-4 !py-2 ${cat === ALL ? "chip-active" : ""}`}
          >
            সব ({bnNum(books.length)})
          </button>
          {categories.map(([name, count]) => (
            <button
              key={name}
              onClick={() => { setCat(name); setVisible(PAGE_SIZE); }}
              className={`chip shrink-0 !px-4 !py-2 ${cat === name ? "chip-active" : ""}`}
            >
              {name} ({bnNum(count)})
            </button>
          ))}
        </div>
      )}

      {!loading && (
        <div className="mb-2 mt-1 text-xs font-bold text-ink-faint">
          {bnNum(filtered.length)}টি বই
        </div>
      )}

      {loading ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card animate-pulse p-3">
              <div className="aspect-[3/4] rounded-xl bg-sand-dark" />
              <div className="mt-2 h-3.5 w-3/4 rounded-full bg-sand-dark" />
              <div className="mt-1.5 h-3 w-1/2 rounded-full bg-sand-dark" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-3">
          <EmptyState icon="library" title="বই পাওয়া যায়নি" hint="অন্য শব্দে খুঁজে দেখুন" />
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {list.map((b, i) => (
              <div key={`${b.source}-${b.id}-${i}`} className="card card-hover flex flex-col overflow-hidden">
                <a
                  href={b.pdf || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900"
                >
                  {b.cover ? (
                    <img
                      src={b.cover}
                      alt={b.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-gold-100">
                      <Icon name="book" size={34} />
                    </span>
                  )}
                </a>
                <div className="flex flex-1 flex-col p-3">
                  <div className="line-clamp-2 text-[13px] font-bold leading-snug">{b.title}</div>
                  {b.author && (
                    <div className="mt-0.5 line-clamp-1 text-[11px] text-ink-faint">{b.author}</div>
                  )}
                  {b.category && (
                    <span className="mt-1 line-clamp-1 text-[10px] font-bold text-primary-700">{b.category}</span>
                  )}
                  {b.pdf && (
                    <div className="mt-auto flex gap-1.5 pt-2.5">
                      <a href={b.pdf} target="_blank" rel="noreferrer" className="btn-primary flex-1 !py-1.5 !text-[11px]">
                        পড়ুন
                      </a>
                      <a href={b.pdf} download aria-label="download" className="btn-ghost !rounded-xl !p-2">
                        <Icon name="download" size={15} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {visible < filtered.length && (
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="btn-outline mt-4 w-full !py-2.5 text-[13px]"
            >
              আরও দেখুন ({bnNum(filtered.length - visible)}টি বাকি)
            </button>
          )}
        </>
      )}
    </div>
  );
}
