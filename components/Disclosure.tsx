"use client";
import { useId, useState } from "react";
import { Collapse } from "./Collapse";

// A card-style disclosure that replaces native <details> so every expandable
// card shares the same height/opacity animation. `summary` receives the open
// state so callers can rotate their chevron.
export function Disclosure({
  className = "card p-4",
  summaryClassName = "flex w-full items-center gap-2 text-start",
  defaultOpen = false,
  summary,
  children,
}: {
  className?: string;
  summaryClassName?: string;
  defaultOpen?: boolean;
  summary: (open: boolean) => React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={summaryClassName}
      >
        {summary(open)}
      </button>
      <Collapse open={open} id={id}>
        {children}
      </Collapse>
    </div>
  );
}
