"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHead, ShareCopy } from "../../components/ui";
import { Icon } from "../../components/icons";
import {
  MISSION_HEADER_TITLE,
  MISSION_TITLE,
  MISSION_SUBTITLE,
  MISSION_SECTIONS,
  MISSION_FINAL_STATEMENT,
  MISSION_FINAL_ECHO,
  MISSION_DUA,
  MISSION_AMEEN,
} from "../../lib/mission";
import { useLang, useTx } from "../../store/language-store";
import { useLocalizedData } from "../../lib/content-translate";

const QUOTE_STYLES: Record<string, string> = {
  gold: "border-gold/40 bg-gold-light/60 text-ink",
  blue: "border-sky-500/30 bg-sky-50 text-ink",
  pink: "border-rose-500/30 bg-rose-50 text-ink",
  teal: "border-teal-500/30 bg-teal-50 text-ink",
};

const SECTION_ICONS: Record<string, string> = {
  intro: "book",
  lineage: "users",
  goal: "star",
  path: "compass",
  sohbat: "heart",
  tasawwuf: "sparkle",
  dream: "moon",
  end: "check",
};

const MISSION_CONTENT = {
  headerTitle: MISSION_HEADER_TITLE,
  title: MISSION_TITLE,
  subtitle: MISSION_SUBTITLE,
  sections: MISSION_SECTIONS,
  finalStatement: MISSION_FINAL_STATEMENT,
  finalEcho: MISSION_FINAL_ECHO,
  dua: MISSION_DUA,
  ameen: MISSION_AMEEN,
};

// Shaykh's mission — ported from beta MissionView, Bengali content only.
export default function MissionPage() {
  const tx = useTx();
  const lang = useLang();
  const [content, setContent] = useState(MISSION_CONTENT);
  useEffect(() => {
    let live = true;
    if (lang === "bn") {
      setContent(MISSION_CONTENT);
      return;
    }
    fetch(`/data/mission.${lang}.json`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((next) => { if (live) setContent(next); })
      .catch(() => { if (live) setContent(MISSION_CONTENT); });
    return () => { live = false; };
  }, [lang]);
  const mission = useLocalizedData(content, lang);
  return (
    <div className="animate-fade-up">
      <PageHead
        title={mission.headerTitle}
        subtitle={mission.subtitle}
        icon="star"
        backHref="/paribar"
      />

      <div className="card mt-3 p-5 text-center sm:p-6">
        <div className="gold-text text-xl font-bold leading-snug">{mission.title}</div>
        <div className="mt-3 flex items-center justify-center gap-2" aria-hidden>
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
          <Icon name="star" size={14} className="text-gold-600" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
        </div>
      </div>

      <div className="mt-2 space-y-2">
        {mission.sections.map((s) => (
          <div key={s.id} className="card p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className="icon-tile !h-10 !w-10 bg-primary-50 text-primary-600">
                <Icon name={SECTION_ICONS[s.icon] || "book"} size={20} />
              </span>
              <h2 className="flex-1 text-[16px] font-bold leading-snug">{s.title}</h2>
            </div>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-2 text-sm leading-relaxed text-ink-soft">{p}</p>
            ))}
            {s.quote && (
              <blockquote className={`mt-3 rounded-2xl border-l-4 p-3.5 text-sm font-bold leading-relaxed ${QUOTE_STYLES[s.quote.color] || QUOTE_STYLES.gold}`}>
                {s.quote.text}
              </blockquote>
            )}
            {(s.quoteAfter || []).map((p, i) => (
              <p key={`qa-${i}`} className="mt-2 text-sm leading-relaxed text-ink-soft">{p}</p>
            ))}
            {(s.bullets || []).length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {s.bullets!.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Icon name="check" size={15} className="mt-0.5 shrink-0 text-primary-600" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.bulletsAfter && <p className="mt-2 text-sm font-bold text-primary-700">{s.bulletsAfter}</p>}
            {(s.bullets2 || []).length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {s.bullets2!.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Icon name="check" size={15} className="mt-0.5 shrink-0 text-gold-600" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="card mt-2 border-gold/30 bg-gold-light/50 p-5 text-center">
        <p className="text-[15px] font-bold leading-relaxed">{mission.finalStatement}</p>
        <p className="mt-2 text-[13px] font-bold text-gold-dark">{mission.finalEcho}</p>
      </div>

      <div className="card mt-2 p-5">
        <p className="whitespace-pre-line text-sm leading-loose">{mission.dua}</p>
        <p className="font-arabic mt-2 text-center text-2xl text-primary-700">آمِين يَا رَبَّ الْعَالَمِين</p>
        <p className="mt-1 text-center text-sm font-bold">{mission.ameen}</p>
        <div className="mt-3">
          <ShareCopy text={`${mission.title}\n${mission.finalStatement}\n${mission.dua}`} />
        </div>
      </div>

      <Link href="/paribar" className="btn-ghost mt-3 w-full">
        <Icon name="back" size={16} /> {tx("পরিবারে ফিরুন")}
      </Link>
    </div>
  );
}
