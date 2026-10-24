"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHead, ShareCopy, EmptyState } from "../../../components/ui";
import { Icon } from "../../../components/icons";
import { stripHtml, BN_TAFSIRS } from "../../../lib/quran";
import { surahBnFull } from "../../../lib/surah-names";
import { useLang, useTx } from "../../../store/language-store";

// Dedicated tafsir page (muslimbangla /sura/N/tafsir/M pattern):
// full tafsir text of one ayah with Arabic + translation on top.
function TafsirBody() {
  const tx = useTx();
  const lang = useLang();
  const params = useSearchParams();
  const surah = Math.min(114, Math.max(1, Number(params.get("surah")) || 1));
  const ayah = Math.max(1, Number(params.get("ayah")) || 1);
  const [tafsirId, setTafsirId] = useState(165);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    fetch(`/api/quran/verse?key=${surah}:${ayah}&translations=161&tafsirs=${tafsirId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error || !d.verse) throw new Error();
        setData(d.verse);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [surah, ayah, tafsirId]);

  const taf = data?.tafsirs?.[0]?.text || "";
  const tr = stripHtml(data?.translations?.[0]?.text || "");

  return (
    <div className="animate-fade-up">
      <PageHead
        title={`${tx("তাফসীর")} ${surah}:${ayah}`}
        subtitle={lang === "bn" ? surahBnFull(surah) : `${tx("সূরা")} ${surah}`}
        icon="doc"
        backHref={`/quran/read?surah=${surah}&ayah=${ayah}`}
      />

      <select value={tafsirId} onChange={(e) => setTafsirId(Number(e.target.value))} className="input mt-3" aria-label="tafsir">
        {BN_TAFSIRS.map((t) => <option key={t.id} value={t.id}>{tx(t.label)}</option>)}
      </select>

      {loading ? (
        <div className="card mt-3 animate-pulse p-5">
          <div className="h-6 w-full rounded-xl bg-sand-dark" />
          <div className="mt-3 h-3 w-full rounded-full bg-sand-dark" />
          <div className="mt-2 h-3 w-2/3 rounded-full bg-sand-dark" />
        </div>
      ) : failed || !data ? (
        <div className="mt-3"><EmptyState icon="doc" title={tx("তাফসীর লোড হয়নি")} /></div>
      ) : (
        <>
          <div className="card mt-3 p-4 sm:p-5">
            <span className="ayah-badge">{surah}:{ayah}</span>
            <div className="font-arabic mt-2 text-[24px]" dir="rtl">
              {data.text_uthmani || data.text_imlaei}
            </div>
            {tr && <div className="mt-2 border-l-[3px] border-primary-200 pl-3 text-[15px] leading-relaxed">{tr}</div>}
          </div>
          <div className="card mt-2 border-gold/30 bg-gold-light/50 p-4 sm:p-5">
            <div className="mb-2 text-xs font-bold text-gold-dark">
              {tx("তাফসীর")} — {tx(BN_TAFSIRS.find((t) => t.id === tafsirId)?.label || "")}
            </div>
            {taf ? (
              <div className="whitespace-pre-line text-sm leading-loose">{stripHtml(taf)}</div>
            ) : (
              <p className="text-sm text-ink-faint">{tx("এই আয়াতের তাফসীর পাওয়া যায়নি।")}</p>
            )}
          </div>
          <div className="card mt-2 p-4">
            <ShareCopy text={`${data.text_uthmani || ""}\n${tr}\n${tx("তাফসীর:")} ${stripHtml(taf).slice(0, 500)}\n(${surah}:${ayah})`} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ayah > 1 && (
              <Link href={`/quran/tafsir?surah=${surah}&ayah=${ayah - 1}`} className="btn-ghost">
                <Icon name="back" size={15} /> {tx("আগের আয়াত")}
              </Link>
            )}
            <Link href={`/quran/tafsir?surah=${surah}&ayah=${ayah + 1}`} className="btn-ghost">
              {tx("পরের আয়াত")} <Icon name="chevron" size={15} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function QuranTafsirPage() {
  return (
    <Suspense>
      <TafsirBody />
    </Suspense>
  );
}
