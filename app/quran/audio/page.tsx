"use client";
import { useState } from "react";
import Link from "next/link";

const QARIS = [
  { id: "Ali_Hajjaj_AlSuesy_128kbps", name: "আলী হাজ্জাজ আস-সুয়েসি", base: "https://everyayah.com/data/Ali_Hajjaj_AlSuesy_128kbps/" },
  { id: "mishary", name: "মিশারী রাশিদ", base: "https://everyayah.com/data/Mishary_Rashid_128kbps/" },
  { id: "wbw", name: "শব্দ-শব্দ (WBW)", base: "https://audio.qurancdn.com/wbw/" },
];

export default function QuranAudio() {
  const [qari, setQari] = useState(0);
  const [surah, setSurah] = useState(1);
  const [downloads, setDownloads] = useState<number[]>([]);

  const pad = (n: number) => String(n).padStart(3, "0");
  const src = `${QARIS[qari].base}${pad(surah)}.mp3`;

  return (
    <div>
      <Link href="/quran" className="text-primary text-sm font-semibold">← কুরআন হোম</Link>
      <h1 className="text-2xl font-bold mt-1">অডিও কুরআন (MP3)</h1>
      <p className="text-sm text-stone-500">QuranMp3Player • Mp3Downloads • QariSelector • FloatingPlayer</p>
      <div className="card p-4 mt-3">
        <label className="text-sm font-bold">ক্বারী चुनুন</label>
        <select value={qari} onChange={(e) => setQari(Number(e.target.value))} className="input mt-1">
          {QARIS.map((x, i) => <option key={x.id} value={i}>{x.name}</option>)}
        </select>
        <label className="text-sm font-bold mt-3 block">সূরা নম্বর (১–১১৪)</label>
        <input type="number" min={1} max={114} value={surah} onChange={(e) => setSurah(Number(e.target.value))} className="input mt-1" />
        <audio key={src} controls src={src} className="w-full mt-3" preload="none" />
        <div className="flex gap-2 mt-3">
          <a href={src} download className="btn-primary flex-1 text-center">⬇ ডাউনলোড</a>
          <button className="btn-primary flex-1 !bg-gold !text-ink" onClick={() => setDownloads([...downloads, surah])}>➕ My Downloads</button>
        </div>
      </div>
      <div className="card p-4 mt-2 text-sm">
        <b>Mp3DownloadsScreen:</b> {downloads.length ? downloads.map((d) => `সূরা ${d}`).join(", ") : "এখনো কিছু ডাউনলোড করেননি (এই সেশনে)।"}
      </div>
    </div>
  );
}
