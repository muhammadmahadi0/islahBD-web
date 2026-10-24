// Consistent inline SVG icon set — replaces emoji icons across the whole site.
const paths: Record<string, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />,
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Zm0 15A2.5 2.5 0 0 1 6.5 18H20" />,
  openbook: (
    <>
      <path d="M12 6.5C10 5 7 4.5 4 4.5v14c3 0 6 .5 8 2 2-1.5 5-2 8-2v-14c-3 0-6 .5-8 2Z" />
      <path d="M12 6.5v14" />
    </>
  ),
  radio: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" />
    </>
  ),
  library: <path d="M4 4v16M9 4v16M13 5l4 14M17.5 5.5 21 19M2 20h20" />,
  playlist: (
    <>
      <path d="M4 6h11M4 12h11M4 18h7" />
      <path d="m15 14.5 5 3.5-5 3.5v-7Z" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  phone: (
    <>
      <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </>
  ),
  bell: <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Zm4.5 11a1.8 1.8 0 0 0 3 0" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.14-1.4l2-1.55-2-3.46-2.36.95a7 7 0 0 0-2.42-1.4L13.7 2.6h-3.4l-.38 2.54a7 7 0 0 0-2.42 1.4l-2.36-.95-2 3.46 2 1.55a7 7 0 0 0 0 2.8l-2 1.55 2 3.46 2.36-.95a7 7 0 0 0 2.42 1.4l.38 2.54h3.4l.38-2.54a7 7 0 0 0 2.42-1.4l2.36.95 2-3.46-2-1.55c.1-.46.14-.92.14-1.4Z" />
    </>
  ),
  mosque: (
    <>
      <path d="M4 20v-8c0-4 3.5-7 8-7s8 3 8 7v8" />
      <path d="M12 5V2.5M10.5 4 12 2.5 13.5 4" />
      <path d="M2 20h20M9 20v-4a3 3 0 0 1 6 0v4" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  beads: (
    <>
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="17" cy="8" r="1.6" />
      <circle cx="19" cy="13.5" r="1.6" />
      <circle cx="15.5" cy="18.5" r="1.6" />
      <circle cx="9.5" cy="19.5" r="1.6" />
      <path d="M12 6.6v2.4M12 9h0" />
    </>
  ),
  // Two open palms raised in dua. Palm outline adapted from Phosphor Icons
  // "hand-palm" (MIT) — filled glyph so the fingers survive a 20px tile.
  hands: (
    <>
      <path
        d="M188,88a27.75,27.75,0,0,0-12,2.71V60a28,28,0,0,0-41.36-24.6A28,28,0,0,0,80,44v6.71A27.75,27.75,0,0,0,68,48,28,28,0,0,0,40,76v76a88,88,0,0,0,176,0V116A28,28,0,0,0,188,88Zm12,64a72,72,0,0,1-144,0V76a12,12,0,0,1,24,0v44a8,8,0,0,0,16,0V44a12,12,0,0,1,24,0v68a8,8,0,0,0,16,0V60a12,12,0,0,1,24,0v68.67A48.08,48.08,0,0,0,120,176a8,8,0,0,0,16,0,32,32,0,0,1,32-32,8,8,0,0,0,8-8V116a12,12,0,0,1,24,0Z"
        transform="translate(12 12) translate(-5.9 0) scale(0.06) translate(-128 -132)"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M188,88a27.75,27.75,0,0,0-12,2.71V60a28,28,0,0,0-41.36-24.6A28,28,0,0,0,80,44v6.71A27.75,27.75,0,0,0,68,48,28,28,0,0,0,40,76v76a88,88,0,0,0,176,0V116A28,28,0,0,0,188,88Zm12,64a72,72,0,0,1-144,0V76a12,12,0,0,1,24,0v44a8,8,0,0,0,16,0V44a12,12,0,0,1,24,0v68a8,8,0,0,0,16,0V60a12,12,0,0,1,24,0v68.67A48.08,48.08,0,0,0,120,176a8,8,0,0,0,16,0,32,32,0,0,1,32-32,8,8,0,0,0,8-8V116a12,12,0,0,1,24,0Z"
        transform="translate(12 12) translate(5.9 0) scale(-0.06 0.06) translate(-128 -132)"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  sparkle: <path d="M12 3v5m0 8v5M3 12h5m8 0h5M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19" />
    </>
  ),
  sunrise: (
    <>
      <path d="M12 3v8m0-8L8.5 6.5M12 3l3.5 3.5" />
      <path d="M5 13a7 7 0 0 1 14 0" />
      <path d="M3 17.5h18M5 21h14" />
    </>
  ),
  sunset: (
    <>
      <path d="M12 3v8m0 0 3.5-3.5M12 11l-3.5-3.5" />
      <path d="M5 13a7 7 0 0 1 14 0" />
      <path d="M3 17.5h18M5 21h14" />
    </>
  ),
  leaf: <path d="M5 19C5 9 12 4 20 4c0 8-5 15-15 15Zm0 0c3-5 7-9 11-11" />,
  gem: <path d="M7 3h10l4 6-9 12L3 9l4-6Zm0 0 5 6 5-6M3 9h18M12 9v12" />,
  kaaba: (
    <>
      <rect x="4" y="8" width="16" height="12" rx="1.5" />
      <path d="M4 11h16M12 8v12" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  feather: <path d="M20 4c-6 0-12 3-14 10l-2 6 6-2c7-2 10-8 10-14ZM6 18c2-5 6-9 11-11" />,
  chat: <path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 4V6Z" />,
  heart: <path d="M12 20.5S3.5 15.5 3.5 9.5A4.5 4.5 0 0 1 8 5c1.7 0 3.2.9 4 2.3A4.5 4.5 0 0 1 16 5a4.5 4.5 0 0 1 4.5 4.5c0 6-8.5 11-8.5 11Z" />,
  play: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m10.5 9.5 5 2.5-5 2.5v-5Z" />
    </>
  ),
  playfill: <path d="M8 5.5v13l11-6.5-11-6.5Z" />,
  youtube: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="m10.2 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
    </>
  ),
  pause: (
    <>
      <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
    </>
  ),
  prev: <path d="M6 5.5v13M19 5.5 10 12l9 6.5v-13Z" />,
  next: <path d="M18 5.5v13M5 5.5l9 6.5-9 6.5v-13Z" />,
  headphones: <path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14H2.5v4H5m14-4h1.5v4H19M5 18v1.5A1.5 1.5 0 0 0 6.5 21H8v-6H6.5M19 15h-1.5v6H19a1.5 1.5 0 0 0 1.5-1.5V18" />,
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m5 18 5.5-5.5 3 3L17 12l4 4" />
    </>
  ),
  mountain: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="m7 16 3.5-5 2.5 3.5 2-2.5L19 16" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M17.5 14.2a6.5 6.5 0 0 1 4 5.8" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.3A2.6 2.6 0 0 1 12 7.5c1.4 0 2.6 1 2.6 2.3 0 1.7-2.1 2-2.4 3.7M12 17h0" />
    </>
  ),
  mega: <path d="M4 10v4a1.5 1.5 0 0 0 1.5 1.5H9l5 4V5L9 8.5H5.5A1.5 1.5 0 0 0 4 10Zm14.5-2.5a4 4 0 0 1 0 9M18 5.5v13" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  back: <path d="M15 5l-7 7 7 7" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.8" />
      <circle cx="18" cy="5.5" r="2.8" />
      <circle cx="18" cy="18.5" r="2.8" />
      <path d="m8.6 10.7 6.8-4M8.6 13.3l6.8 4" />
    </>
  ),
  bookmark: <path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-4-6 4V4.5a1 1 0 0 1 1-1Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5S5 15.6 5 10a7 7 0 0 1 14 0c0 5.6-7 11.5-7 11.5Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  download: <path d="M12 3v11m0 0 4-4m-4 4-4-4M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  external: (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
    </>
  ),
  music: (
    <>
      <circle cx="7" cy="17.5" r="3" />
      <circle cx="17" cy="15.5" r="3" />
      <path d="M10 17.5V5l10-2v12.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </>
  ),
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />,
  gift: (
    <>
      <rect x="4" y="9" width="16" height="4" rx="1" />
      <path d="M6 13v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7M12 9v12M12 9S8 9 6.5 7.5 7 4 9 4.5 12 9 12 9Zm0 0s4 0 5.5-1.5S17 4 15 4.5 12 9 12 9Z" />
    </>
  ),
  shield: <path d="M12 2.5 5 5.5v6c0 5 3 8.3 7 10 4-1.7 7-5 7-10v-6l-7-3Z" />,
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 22,
  className = "",
  strokeWidth = 1.8,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      {paths[name] ?? paths.grid}
    </svg>
  );
}
