"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "../../../components/icons";
import { EmptyState } from "../../../components/ui";
import { PdfReader } from "../../../components/PdfReader";
import type { ReaderBook } from "../../../lib/islamijindegi";
import { useLang, useTx } from "../../../store/language-store";
import { useLocalizedData } from "../../../lib/content-translate";

type Section = {
  id: string;
  title: string;
  html: string;
  parentTitle?: string;
};

export default function BookReaderPage() {
  const tx = useTx();
  const lang = useLang();
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const [book, setBook] = useState<ReaderBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [size, setSize] = useState(18);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;
    let dead = false;
    setLoading(true);
    setBook(null);
    setActiveId("");
    fetch(`/api/books/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (dead) return;
        if (!d.success) throw new Error(d.error || "load failed");
        setBook(d.book);
        setError("");
      })
      .catch(() => {
        if (!dead) setError("কিতাবের লেখা লোড করা যাচ্ছে না — ইন্টারনেট চেক করুন।");
      })
      .finally(() => {
        if (!dead) setLoading(false);
      });
    return () => { dead = true; };
  }, [id]);

  const sections = useMemo<Section[]>(() => {
    if (!book) return [];
    return book.chapters.flatMap((c) => [
      { id: c.id, title: c.title, html: c.body },
      ...c.subChapters.map((s) => ({
        id: s.id,
        title: s.title,
        html: s.body,
        parentTitle: c.title,
      })),
    ]);
  }, [book]);

  // Open the first section that actually has readable text.
  useEffect(() => {
    if (!sections.length || activeId) return;
    const first = sections.find((s) => s.html) || sections[0];
    setActiveId(first.id);
  }, [sections, activeId]);

  // Localize the title/author/table of contents only — chapter bodies stay in
  // their source language (the reader is a book reproduction, not chrome).
  const bookMeta = useMemo(() => book ? {
    title: book.title,
    author: book.author,
    category: book.category,
    chapters: book.chapters.map((c) => ({
      id: c.id,
      title: c.title,
      subChapters: c.subChapters.map((s) => ({ id: s.id, title: s.title })),
    })),
  } : null, [book]);
  const metaL = useLocalizedData(bookMeta, lang);
  const chapters = metaL?.chapters ?? book?.chapters ?? [];
  const active = sections.find((s) => s.id === activeId) || null;
  const activeChapter = book?.chapters.find((c) => c.id === activeId) || null;
  const activeTitle = chapters.find((c) => c.id === activeId)?.title
    || chapters.flatMap((c) => c.subChapters).find((s) => s.id === activeId)?.title
    || active?.title
    || book?.title;
  const activeIndex = sections.findIndex((s) => s.id === activeId);
  // Many kitabs are PDF-only on the source site; those get an inline viewer.
  const hasText = sections.some((s) => s.html.length > 40);

  const go = (sectionId: string) => {
    setActiveId(sectionId);
    setNavOpen(false);
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const step = (dir: -1 | 1) => {
    for (let i = activeIndex + dir; i >= 0 && i < sections.length; i += dir) {
      if (sections[i].html) { go(sections[i].id); return; }
    }
  };

  const navBody = book && (
    <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
      {chapters.map((c) => (
        <div key={c.id} className="mb-1">
          <button
            onClick={() => go(c.id)}
            className={`flex w-full items-start gap-1.5 rounded-xl px-2.5 py-2 text-left text-[13px] font-bold leading-snug transition ${
              activeId === c.id ? "bg-primary-50 text-primary-700" : "text-ink-soft hover:bg-sand"
            }`}
          >
            <Icon name="book" size={14} className="mt-0.5 shrink-0 opacity-70" />
            <span className="min-w-0 flex-1">{c.title}</span>
          </button>
          {c.subChapters.length > 0 && (
            <div className="ml-3 border-l border-primary-900/10 pl-1 dark:border-white/10">
              {c.subChapters.map((s) => (
                <button
                  key={s.id}
                  onClick={() => go(s.id)}
                  className={`flex w-full items-start gap-1 rounded-lg px-2 py-1.5 text-left text-[12px] leading-snug transition ${
                    activeId === s.id ? "bg-primary-50 font-bold text-primary-700" : "text-ink-faint hover:bg-sand"
                  }`}
                >
                  <span className="min-w-0 flex-1">{s.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-up">
      {/* reader toolbar */}
      <div className="sticky top-0 z-30 -mx-3 border-b border-primary-900/10 bg-white/95 px-3 py-2 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 sm:-mx-4">
        <div className="flex items-center gap-1.5">
          <Link href="/library" aria-label={tx("লাইব্রেরিতে ফিরুন")} className="btn-ghost shrink-0 !rounded-xl !p-2">
            <Icon name="back" size={17} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold leading-tight">{metaL?.title || book?.title || tx("কিতাব")}</div>
            {metaL?.author && <div className="truncate text-[11px] text-ink-faint">{metaL.author}</div>}
          </div>
          {hasText && (
            <button
              onClick={() => setNavOpen(true)}
              aria-label={tx("সূচিপত্র")}
              className="btn-ghost shrink-0 !rounded-xl !p-2 lg:hidden"
            >
              <Icon name="menu" size={18} />
            </button>
          )}
          {hasText && (
            <div className="hidden items-center gap-1 rounded-xl border border-primary-900/10 px-1 py-0.5 dark:border-white/10 sm:flex">
              <button onClick={() => setSize((s) => Math.max(15, s - 1))} aria-label={tx("লেখা ছোট করুন")} className="rounded-lg p-1.5 text-ink-faint hover:bg-sand">
                <Icon name="chevron" size={13} className="-rotate-90" />
              </button>
              <span className="w-6 text-center text-[11px] font-bold tabular-nums text-ink-faint">{size}</span>
              <button onClick={() => setSize((s) => Math.min(26, s + 1))} aria-label={tx("লেখা বড় করুন")} className="rounded-lg p-1.5 text-ink-faint hover:bg-sand">
                <Icon name="chevron" size={13} className="rotate-90" />
              </button>
            </div>
          )}
          {book?.pdf && (
            <a
              href={book.pdf}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost shrink-0 !rounded-xl !px-2.5 !py-2 !text-[11px]"
            >
              <Icon name="doc" size={14} />
              <span className="hidden sm:inline">PDF</span>
            </a>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="card hidden animate-pulse space-y-2 p-3 lg:block">
            {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-7 rounded-xl bg-sand-dark" />)}
          </div>
          <div className="card animate-pulse space-y-3 p-6">
            <div className="h-7 w-2/3 rounded-full bg-sand-dark" />
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-3.5 rounded-full bg-sand-dark" />)}
          </div>
        </div>
      ) : error ? (
        <div className="mt-4">
          <EmptyState icon="library" title={tx(error)} hint={tx("পুনরায় চেষ্টা করুন")} />
          <button onClick={() => location.reload()} className="btn-outline mt-3 w-full !py-2.5 text-[13px]">
            <Icon name="prev" size={15} /> {tx("আবার চেষ্টা করুন")}
          </button>
        </div>
      ) : !book ? null : !hasText && book.pdf ? (
        <div className="mt-3">
          <div className="card mb-3 flex items-center gap-3 p-3">
            <span className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary-700 to-primary-900">
              {book.cover ? (
                <img src={book.cover} alt={metaL?.title || book.title} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-gold-100">
                  <Icon name="book" size={24} />
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="line-clamp-2 text-[15px] font-bold leading-snug">{metaL?.title || book?.title}</div>
              {metaL?.author && <div className="mt-0.5 text-xs text-ink-faint">{metaL.author}</div>}
              <div className="mt-1 text-[11px] font-bold text-primary-700">{tx("PDF কিতাব")}</div>
            </div>
          </div>

          <PdfReader src={book.pdf} title={metaL?.title || book.title} />
          <p className="mt-2 px-1 text-[11px] leading-relaxed text-ink-faint">
            {tx("পাতার সংখ্যা বাড়ালে বা কমালে নিচের তীর চিহ্ন ব্যবহার করুন। চাইলে মূল PDF নতুন ট্যাবে খুলতে বা ডাউনলোড করতে পারেন।")}
          </p>
        </div>
      ) : (
        <div className="mt-3 flex gap-4">
          {/* desktop chapter sidebar */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="card sticky top-[68px] flex max-h-[78vh] flex-col overflow-hidden p-2">
              <div className="flex items-center gap-1.5 px-2 py-2 text-[12px] font-bold text-ink-faint">
                <Icon name="book" size={14} />
                {tx("সূচিপত্র")}
              </div>
              {navBody}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {/* cover header */}
            <div className="card mb-3 flex items-center gap-3 p-3">
              <span className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary-700 to-primary-900">
                {book.cover ? (
                  <img src={book.cover} alt={metaL?.title || book.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-gold-100">
                    <Icon name="book" size={24} />
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-[15px] font-bold leading-snug">{metaL?.title || book?.title}</div>
                {metaL?.author && <div className="mt-0.5 text-xs text-ink-faint">{metaL.author}</div>}
                {metaL?.category && <div className="mt-1 line-clamp-1 text-[11px] font-bold text-primary-700">{metaL.category}</div>}
              </div>
            </div>

            <div ref={contentRef} className="card scroll-mt-16 p-4 sm:p-6">
              {active?.parentTitle && (
                <div className="mb-1 text-[11px] font-bold text-ink-faint">{chapters.find((c) => c.id === activeChapter?.id)?.title || active.parentTitle}</div>
              )}
              <h1 className="mb-4 text-xl font-bold leading-tight sm:text-2xl">{activeTitle}</h1>

              {active?.html ? (
                <div
                  className="reader-prose"
                  style={{ fontSize: size, lineHeight: 1.9 }}
                  dangerouslySetInnerHTML={{ __html: active.html }}
                />
              ) : activeChapter && activeChapter.subChapters.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="mb-2 text-[12px] font-bold text-ink-faint">
                    {tx("এই অধ্যায়ে নিম্নলিখিত বিষয়গুলো রয়েছে:")}
                  </p>
                  {(chapters.find((c) => c.id === activeChapter.id)?.subChapters || activeChapter.subChapters).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => go(s.id)}
                      className="flex w-full items-center gap-2 rounded-xl bg-sand px-3 py-2.5 text-left text-[13px] font-bold text-ink-soft transition hover:bg-primary-50 hover:text-primary-700 dark:bg-white/5"
                    >
                      <Icon name="doc" size={14} className="shrink-0 opacity-70" />
                      <span className="min-w-0 flex-1">{s.title}</span>
                      <Icon name="chevron" size={14} className="shrink-0 opacity-60" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-faint">{tx("এই অংশে এখনো কোনো লেখা যোগ করা হয়নি।")}</p>
              )}

              {/* prev / next */}
              <div className="mt-6 flex gap-2 border-t border-primary-900/10 pt-4 dark:border-white/10">
                <button
                  onClick={() => step(-1)}
                  disabled={activeIndex <= 0}
                  className="btn-ghost flex-1 !py-2 text-[12px] disabled:opacity-40"
                >
                  <Icon name="prev" size={14} /> {tx("আগের অংশ")}
                </button>
                <button
                  onClick={() => step(1)}
                  disabled={activeIndex >= sections.length - 1}
                  className="btn-ghost flex-1 !py-2 text-[12px] disabled:opacity-40"
                >
                  {tx("পরের অংশ")} <Icon name="next" size={14} />
                </button>
              </div>
            </div>

            {book.pdf && (
              <a href={book.pdf} target="_blank" rel="noreferrer" className="btn-outline mt-3 w-full !py-2.5 text-[12px]">
                <Icon name="doc" size={15} /> {tx("মূল PDF দেখুন")}
              </a>
            )}
          </div>
        </div>
      )}

      {/* mobile chapter drawer */}
      {navOpen && book && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setNavOpen(false)} />
          <div className="card absolute bottom-2 left-2 top-2 flex w-72 max-w-[85vw] flex-col overflow-hidden p-2">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="flex items-center gap-1.5 text-sm font-bold">
                <Icon name="book" size={15} /> {tx("সূচিপত্র")}
              </span>
              <button onClick={() => setNavOpen(false)} className="rounded-xl p-1.5 text-ink-faint hover:bg-sand" aria-label="close">
                <Icon name="x" size={18} />
              </button>
            </div>
            {navBody}
          </div>
        </div>
      )}
    </div>
  );
}
