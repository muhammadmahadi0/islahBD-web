"use client";
import Link from "next/link";
import { Icon } from "../../components/icons";
import ChannelButton from "../../components/ChannelButton";
import { othersSections } from "../../lib/others";
import { useTx } from "../../store/language-store";

// Others hub — categorised feature directory.
export default function OthersPage() {
  const tx = useTx();

  return (
    <div className="animate-fade-up">
      <header className="border-b border-primary-900/10 pb-3 text-center dark:border-white/10">
        <h1 className="text-[20px] font-bold leading-snug tracking-tight">{tx("অন্যান্য")}</h1>
        <p className="mt-1 text-[13px] font-medium text-ink-faint">{tx("সকল ফিচার একসাথে")}</p>
      </header>

      {/* Channels — both channels live inside this one button (master registry) */}
      <ChannelButton />

      {othersSections.map((section) => (
        <section key={section.titleBn} className="mt-5">
          <div className="mb-3 flex items-center gap-2">
            <span
              aria-hidden
              className={`h-[21px] w-[3px] shrink-0 rounded-sm bg-current ${section.accent}`}
            />
            <Icon name={section.icon} size={17} className={section.accent} />
            <h2 className="text-[18px] font-extrabold leading-tight tracking-tight">
              {tx(section.titleBn)}
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 lg:grid-cols-8">
            {section.items.map((item) => {
              const content = (
                <>
                  {item.soon && (
                    <span className="absolute inset-x-1 top-1 rounded-md bg-sand py-0.5 text-[9px] font-semibold leading-normal text-ink-faint dark:bg-slate-800">
                      {tx("শীঘ্রই আসছে")}
                    </span>
                  )}
                  <Icon
                    name={item.icon}
                    size={30}
                    className={`${item.color} ${item.soon ? "opacity-40" : ""}`}
                  />
                  <span
                    className={`px-0.5 text-[11.5px] font-semibold leading-[1.3] ${
                      item.soon ? "opacity-40" : ""
                    }`}
                  >
                    {tx(item.titleBn)}
                  </span>
                </>
              );

              const cls = `card relative flex min-h-[102px] flex-col items-center justify-center gap-2 px-1.5 text-center ${
                item.soon ? "pb-2.5 pt-6" : "py-2.5"
              }`;

              return item.route ? (
                item.route.startsWith("http") ? (
                  <a
                    key={item.titleBn}
                    href={item.route}
                    target="_blank"
                    rel="noreferrer"
                    className={`${cls} card-hover`}
                  >
                    {content}
                  </a>
                ) : (
                  <Link key={item.titleBn} href={item.route} className={`${cls} card-hover`}>
                    {content}
                  </Link>
                )
              ) : (
                <div key={item.titleBn} aria-disabled="true" className={cls}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
