// Islami Jindegi book reader — fetches a book's SvelteKit data payload
// (`/__data.json`) and decodes its reference table into chapter HTML. The
// listing snapshot lives in public/data/islamijindegi-books.json; chapter text
// is pulled on demand and cached by the API route.
export interface ReaderChapter {
  id: string;
  title: string;
  body: string;
  subChapters: ReaderChapter[];
}

export interface ReaderBook {
  id: string;
  title: string;
  author: string;
  category: string;
  cover: string;
  pdf: string;
  sourceUrl: string;
  chapters: ReaderChapter[];
}

const BASE = "https://islamijindegi.com/bn/books/";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * SvelteKit's data endpoint stores the page payload in a flat array. Objects
 * and arrays contain integer references into that array; negative references
 * are special values (undefined/NaN/Infinity/...). Resolve only references and
 * keep a cache so shared objects and cycles are safe.
 */
function resolveRef(data: unknown[], ref: unknown, cache: Map<number, unknown>): unknown {
  if (typeof ref !== "number") return ref;
  if (ref < 0) {
    if (ref === -1) return undefined;
    if (ref === -2) return NaN;
    if (ref === -3) return Infinity;
    if (ref === -4) return -Infinity;
    if (ref === -5) return -0;
    return undefined;
  }
  if (ref >= data.length) return undefined;
  if (cache.has(ref)) return cache.get(ref);

  const value = data[ref];
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    cache.set(ref, out);
    for (const item of value) out.push(resolveRef(data, item, cache));
    return out;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    cache.set(ref, out);
    for (const [key, item] of Object.entries(value)) {
      out[key] = resolveRef(data, item, cache);
    }
    return out;
  }
  cache.set(ref, value);
  return value;
}

function readerChapter(value: unknown): ReaderChapter {
  const chapter = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const body = typeof chapter.body === "string" ? chapter.body : "";
  return {
    id: String(chapter.id || ""),
    title: String(chapter.title || ""),
    body: cleanHtml(body),
    subChapters: Array.isArray(chapter.subChapters)
      ? chapter.subChapters.map(readerChapter)
      : [],
  };
}

function readerBook(value: unknown, id: string): ReaderBook {
  const book = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const authors = Array.isArray(book.authors) ? book.authors : [];
  const categories = Array.isArray(book.categories) ? book.categories : [];
  const names = (items: unknown[]) =>
    items
      .map((item) => (item && typeof item === "object" ? (item as Record<string, unknown>).name : ""))
      .filter(Boolean)
      .join(", ");
  const titles = (items: unknown[]) =>
    items
      .map((item) => (item && typeof item === "object" ? (item as Record<string, unknown>).title : ""))
      .filter(Boolean)
      .join(", ");

  return {
    id,
    title: String(book.title || "শিরোনামহীন কিতাব"),
    author: names(authors),
    category: titles(categories),
    cover: String(book.coverUrl || ""),
    pdf: String(book.documentUrl || ""),
    sourceUrl: `${BASE}${id}`,
    chapters: Array.isArray(book.chapters) ? book.chapters.map(readerChapter) : [],
  };
}

/** Fetch and decode one book. Throws when the source has no reader data. */
export async function fetchReaderBook(id: string): Promise<ReaderBook> {
  if (!UUID.test(id)) throw new Error("invalid id");

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(`${BASE}${id}/__data.json`, {
      signal: ctl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; IslahWebReader/1.0)",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = (await res.json()) as {
      nodes?: ({ data?: unknown[] } | null)[];
    };
    if (!Array.isArray(payload?.nodes)) throw new Error("invalid data payload");

    for (const node of payload.nodes) {
      if (!node || !Array.isArray(node.data)) continue;
      const data = node.data;
      const rootIndex = data.findIndex(
        (item) =>
          !!item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          "book" in (item as Record<string, unknown>)
      );
      if (rootIndex < 0) continue;

      const root = data[rootIndex] as Record<string, unknown>;
      const book = resolveRef(data, root.book, new Map());
      if (book && typeof book === "object") return readerBook(book, id);
    }
    throw new Error("book data not found");
  } finally {
    clearTimeout(timer);
  }
}
