"use client";
import { useState } from "react";
import { PageHead } from "../../../components/ui";
import { Icon } from "../../../components/icons";

const QARIS = [
  { id: "Ali_Hajjaj_AlSuesy_128kbps", name: "আলী হাজ্জাজ আস-সুয়েসি", base: "https://everyayah.com/data/Ali_Hajjaj_AlSuesy_128kbps/" },
  { id: "mishary", name: "মিশারী রাশিদ", base: "https://everyayah.com/data/Mishary_Rashid_128kbps/" },
  { id: "wbw", name: "শব্দ-শব্দ (WBW)", base: "https://audio.qurancdn.com/wbw/" },
];

export default function QuranAudio() {
  const [qari, setQari] = useState(0);
  const [surah, setSurah] = useState(1);
  const [saved, setSaved] = useState<number[]>([]);

  const pad = (n: number) => String(n).padStart(3, "0");
  const src = `${QARIS[qari].base}${pad(surah)}.mp3`;

  return (
    <div className="animate-fade-up">
      <PageHead title="অডিও কুরআন" subtitle="তিলাওয়াত শুনুন ও ডাউনলোড করুন" icon="headphones" backHref="/quran" />
      <div className="card mt-3 space-y-3 p-4">
        <label className="block text-sm font-bold">
          ক্বারী
          <select value={qari} onChange={(e) => setQari(Number(e.target.value))} className="input mt-1.5">
            {QARIS.map((x, i) => <option key={x.id} value={i}>{x.name}</option>)}
          </select>
        </label>
        <label className="block text-sm font-bold">
          সূরা নম্বর (১–১১৪)
          <input type="number" min={1} max={114} value={surah} onChange={(e) => setSurah(Math.min(114, Math.max(1, Number(e.target.value) || 1)))} className="input mt-1.5" />
        </label>
        <audio key={src} controls src={src} className="w-full" preload="none" />
        <div className="flex gap-2">
          <a href={src} download className="btn-primary flex-1">
            <Icon name="download" size={16} /> ডাউনলোড
          </a>
          <button className="btn-gold flex-1" onClick={() => setSaved((p) => (p.includes(surah) ? p : [...p, surah]))}>
            <Icon name="plus" size={16} /> সংগ্রহে রাখুন
          </button>
        </div>
      </div>
      {saved.length > 0 && (
        <div className="card mt-2 p-4">
          <div className="mb-2 text-sm font-bold">আমার সংগ্রহ ({saved.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {saved.map((s) => <span key={s} className="chip">সূরা {s}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
