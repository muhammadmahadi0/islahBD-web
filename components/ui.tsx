import Link from "next/link";

export function SectionTitle({ title, link, linkLabel = "সব দেখুন" }: { title: string; link?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mt-5 mb-2">
      <h2 className="font-bold text-[17px]">{title}</h2>
      {link && (
        <Link href={link} className="text-primary text-sm font-semibold">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

export function IslamicCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card p-4 ${className}`}>{children}</div>;
}

export function DetailScaffold({
  title, subtitle, arabic, children, meta,
}: {
  title: string; subtitle?: string; arabic?: string; meta?: string; children: React.ReactNode;
}) {
  return (
    <article>
      <div className="card overflow-hidden">
        <div className="bg-primary text-white p-5">
          {arabic && <div className="font-arabic text-2xl leading-relaxed" dir="rtl">{arabic}</div>}
          <h1 className="text-xl font-bold mt-1">{title}</h1>
          {subtitle && <p className="text-sm opacity-90 mt-1">{subtitle}</p>}
          {meta && <p className="text-[12px] opacity-75 mt-2">{meta}</p>}
        </div>
        <div className="p-4 space-y-3">{children}</div>
      </div>
    </article>
  );
}

export function ShareCopy({ text }: { text: string }) {
  return (
    <div className="flex gap-2">
      <button
        className="btn-primary flex-1"
        onClick={() => {
          navigator.clipboard?.writeText(text);
          alert("কপি হয়েছে ✓");
        }}
      >
        📋 কপি
      </button>
      <button
        className="btn-primary flex-1 !bg-gold !text-ink"
        onClick={() => {
          const url = location.href;
          if (navigator.share) navigator.share({ title: document.title, text, url }).catch(() => {});
          else {
            navigator.clipboard?.writeText(`${text}\n${url}`);
            alert("লিংকসহ কপি হয়েছে ✓");
          }
        }}
      >
        ↗ শেয়ার
      </button>
    </div>
  );
}
