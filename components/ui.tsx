"use client";
import Link from "next/link";
import { Icon } from "./icons";

export function SectionTitle({
  title,
  hint,
  link,
  linkLabel = "সব দেখুন",
}: {
  title: string;
  hint?: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-2.5 mt-6 flex items-end justify-between">
      <div>
        <h2 className="text-[18px] font-bold tracking-tight text-ink">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>}
      </div>
      {link && (
        <Link
          href={link}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition hover:bg-primary-100"
        >
          {linkLabel}
          <Icon name="chevron" size={14} />
        </Link>
      )}
    </div>
  );
}

export function PageHead({
  title,
  subtitle,
  backHref = "/",
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-hero animate-fade-up p-5">
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/25 active:scale-95"
          >
            <Icon name="back" size={14} />
            ফিরুন
          </Link>
          {action}
        </div>
        <div className="mt-3 flex items-center gap-3">
          {icon && (
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-gold-100">
              <Icon name={icon} size={26} />
            </span>
          )}
          <div>
            <h1 className="text-[22px] font-bold leading-tight tracking-tight">{title}</h1>
            {subtitle && <p className="mt-0.5 text-[13px] text-white/75">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShareCopy({ text }: { text: string }) {
  const copy = () => {
    navigator.clipboard?.writeText(text);
  };
  const share = () => {
    const url = location.href;
    if (navigator.share) navigator.share({ title: document.title, text, url }).catch(() => {});
    else navigator.clipboard?.writeText(`${text}\n${url}`);
  };
  return (
    <div className="flex gap-2">
      <button className="btn-outline flex-1 !py-2 text-[13px]" onClick={copy}>
        <Icon name="copy" size={16} />
        কপি
      </button>
      <button className="btn-gold flex-1 !py-2 text-[13px]" onClick={share}>
        <Icon name="share" size={16} />
        শেয়ার
      </button>
    </div>
  );
}

export function EmptyState({ icon = "search", title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-8 text-center">
      <span className="icon-tile bg-primary-50 text-primary-600">
        <Icon name={icon} size={26} />
      </span>
      <div className="font-bold">{title}</div>
      {hint && <div className="text-sm text-ink-faint">{hint}</div>}
    </div>
  );
}
