"use client";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { Icon } from "./icons";

/**
 * In-app PDF viewer for kitabs that only ship a PDF. Renders one page at a
 * time via PDF.js and matches the text reader's controls (page navigation,
 * zoom, download). PDF.js is loaded lazily so it never enters the global
 * bundle.
 */
export function PdfReader({ src, title }: { src: string; title: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderRef = useRef<RenderTask | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Keep the render width in sync with the card (rotation-safe).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width || 0;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let dead = false;
    let loaded: PDFDocumentProxy | null = null;
    setLoading(true);
    setError("");
    setDoc(null);
    setPages(0);
    setPage(1);
    setZoom(1);

    (async () => {
      // Legacy build keeps older mobile Safari/Android browsers working.
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      // Copied from node_modules/pdfjs-dist/legacy/build at the pinned version.
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const task = pdfjs.getDocument({ url: src });
      loaded = await task.promise;
      if (dead) {
        loaded.destroy();
        return;
      }
      setDoc(loaded);
      setPages(loaded.numPages);
      setLoading(false);
    })().catch(() => {
      if (!dead) {
        setError("PDF লোড করা যাচ্ছে না।");
        setLoading(false);
      }
    });

    return () => {
      dead = true;
      renderRef.current?.cancel();
      loaded?.destroy();
    };
  }, [src]);

  useEffect(() => {
    if (!doc || !width) return;
    let dead = false;
    (async () => {
      try {
        const p = await doc.getPage(page);
        if (dead) return;
        const base = p.getViewport({ scale: 1 });
        const fit = Math.max(0.2, (width - 8) / base.width);
        const viewport = p.getViewport({ scale: fit * zoom });
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        renderRef.current?.cancel();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const task = p.render({
          canvasContext: ctx,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        });
        renderRef.current = task;
        await task.promise;
      } catch (err) {
        if (!dead && (err as { name?: string })?.name !== "RenderingCancelledException") {
          setError("PDF পৃষ্ঠা দেখানো যাচ্ছে না।");
        }
      }
    })();
    return () => {
      dead = true;
      renderRef.current?.cancel();
    };
  }, [doc, page, zoom, width]);

  const jump = (next: number) => {
    if (!pages) return;
    setPage(Math.min(pages, Math.max(1, next)));
  };

  return (
    <div className="card overflow-hidden">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-primary-900/10 px-2 py-1.5 dark:border-white/10">
        <button
          onClick={() => jump(page - 1)}
          disabled={page <= 1}
          aria-label="আগের পাতা"
          className="rounded-lg p-1.5 text-ink-faint transition hover:bg-sand disabled:opacity-35"
        >
          <Icon name="back" size={16} />
        </button>
        <span className="min-w-[60px] text-center text-[11px] font-bold tabular-nums text-ink-soft">
          {loading ? "…" : `${page} / ${pages}`}
        </span>
        <button
          onClick={() => jump(page + 1)}
          disabled={page >= pages}
          aria-label="পরের পাতা"
          className="rounded-lg p-1.5 text-ink-faint transition hover:bg-sand disabled:opacity-35"
        >
          <Icon name="chevron" size={16} />
        </button>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
            aria-label="জুম আউট"
            className="rounded-lg p-1.5 text-ink-faint transition hover:bg-sand"
          >
            <Icon name="minus" size={15} />
          </button>
          <button
            onClick={() => setZoom(1)}
            aria-label="জুম রিসেট"
            className="min-w-[42px] rounded-lg px-1 py-1 text-center text-[10px] font-bold tabular-nums text-ink-faint hover:bg-sand"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(2.6, Number((z + 0.2).toFixed(1))))}
            aria-label="জুম ইন"
            className="rounded-lg p-1.5 text-ink-faint transition hover:bg-sand"
          >
            <Icon name="plus" size={15} />
          </button>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            aria-label="নতুন ট্যাবে খুলুন"
            className="ml-1 rounded-lg p-1.5 text-ink-faint transition hover:bg-sand"
          >
            <Icon name="external" size={15} />
          </a>
          <a
            href={src}
            download
            aria-label="ডাউনলোড"
            className="rounded-lg p-1.5 text-ink-faint transition hover:bg-sand"
          >
            <Icon name="download" size={15} />
          </a>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative max-h-[74vh] min-h-[52vh] overflow-auto bg-[#f3f1eb] dark:bg-slate-900"
      >
        <div className={`flex p-1 ${zoom > 1 ? "" : "min-w-full justify-center"}`}>
          <canvas ref={canvasRef} className="shrink-0 rounded-sm bg-white shadow-card" />
        </div>

        {(loading || error) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f3f1eb]/90 p-4 text-center dark:bg-slate-900/90">
            {error ? (
              <>
                <Icon name="doc" size={26} className="text-ink-faint" />
                <p className="text-sm font-bold text-ink">{error}</p>
                <div className="mt-1 flex gap-2">
                  <a href={src} target="_blank" rel="noreferrer" className="btn-primary !py-2 text-[12px]">
                    নতুন ট্যাবে খুলুন
                  </a>
                  <a href={src} download className="btn-outline !py-2 text-[12px]">
                    ডাউনলোড
                  </a>
                </div>
              </>
            ) : (
              <>
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                <p className="text-xs font-bold text-ink-faint">PDF লোড হচ্ছে…</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-primary-900/10 px-3 py-1.5 text-[10px] font-bold text-ink-faint dark:border-white/10">
        <span className="truncate">{title}</span>
        <span>পাতা {pages || "—"}</span>
      </div>
    </div>
  );
}
