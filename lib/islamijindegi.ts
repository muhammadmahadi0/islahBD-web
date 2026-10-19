// Islami Jindegi book reader — fetches a book's detail page and decodes the
// RSC payload (`initialBooks`-style object) into chapter HTML. The listing
// snapshot lives in public/data/islamijindegi-books.json; chapter text is
// pulled on demand and cached by the API route.
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

/** Decode `self.__next_f.push([1,"..."])` chunks into one RSC string. */
function decodeRsc(html: string): string {
  const re = /self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)/g;
  let out = "";
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      out += JSON.parse(`"${m[1]}"`);
    } catch {
      // Skip malformed chunk — the rest still decodes.
    }
  }
  return out;
}

/**
 * Extract the text chunks (`<id>:T<byte-length>,<html>`) from the RSC
 * stream. Lengths are UTF-8 byte counts, so scan a latin1 view of the
 * buffer to keep offsets aligned with the declared lengths.
 */
function decodeTextChunks(full: string): Record<string, string> {
  const buf = Buffer.from(full, "utf8");
  const bin = buf.toString("latin1");
  const re = /([0-9a-f]+):T([0-9a-f]+),/g;
  const map: Record<string, string> = {};
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(bin))) {
    if (m.index < cursor) continue;
    const start = m.index + m[0].length;
    const len = parseInt(m[2], 16);
    if (!Number.isFinite(len) || start + len > buf.length) continue;
    map[m[1]] = buf.subarray(start, start + len).toString("utf8");
    cursor = start + len;
    re.lastIndex = cursor;
  }
  return map;
}

/** Slice the balanced `{...}` object that starts at `start`. */
function sliceObject(text: string, start: number): string | null {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function resolveBody(
  chapter: any,
  chunks: Record<string, string>
): ReaderChapter {
  const raw = typeof chapter?.body === "string" ? chapter.body : "";
  const body =
    raw.startsWith("$") && chunks[raw.slice(1)] !== undefined
      ? chunks[raw.slice(1)]
      : raw;
  return {
    id: String(chapter?.id || ""),
    title: String(chapter?.title || ""),
    body: cleanHtml(body),
    subChapters: Array.isArray(chapter?.subChapters)
      ? chapter.subChapters.map((s: any) => resolveBody(s, chunks))
      : [],
  };
}

/** Fetch and decode one book. Throws when the source has no reader data. */
export async function fetchReaderBook(id: string): Promise<ReaderBook> {
  if (!UUID.test(id)) throw new Error("invalid id");

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(`${BASE}${id}`, {
      signal: ctl.signal,
      headers: {
        Accept: "text/html",
        "User-Agent": "Mozilla/5.0 (compatible; IslahWebReader/1.0)",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const full = decodeRsc(html);
    const marker = `{"id":"${id}"`;
    const start = full.indexOf(marker);
    if (start < 0) throw new Error("book data not found");
    const json = sliceObject(full, start);
    if (!json) throw new Error("book data incomplete");

    const raw = JSON.parse(json);
    const chunks = decodeTextChunks(full);
    const chapters = Array.isArray(raw.chapters)
      ? raw.chapters.map((c: any) => resolveBody(c, chunks))
      : [];

    return {
      id,
      title: String(raw.title || "শিরোনামহীন কিতাব"),
      author: (raw.authors || []).map((a: any) => a?.name).filter(Boolean).join(", "),
      category: (raw.categories || []).map((c: any) => c?.title).filter(Boolean).join(", "),
      cover: String(raw.coverUrl || ""),
      pdf: String(raw.documentUrl || ""),
      sourceUrl: `${BASE}${id}`,
      chapters,
    };
  } finally {
    clearTimeout(timer);
  }
}
