import {
  addMinutes,
  getNaflWindows,
  prayerName,
  toMinutes,
  type Lang,
  type PrayerTimes,
} from "./prayer";

// The day's full prayer timeline — shared by the prayer-times page (the
// "full schedule") and the home prayer card so both always agree on which
// period is running right now.

export type PeriodKind = "fard" | "nafl" | "prohibited";

export interface Period {
  key: string;
  name: string;
  kind: PeriodKind;
  icon: string;
  start: string;
  end: string;
  endTomorrow?: boolean;
  note?: string;
}

export function periodRange(start: string, end: string) {
  const s = toMinutes(start);
  let e = toMinutes(end);
  if (e <= s) e += 1440;
  return { start: s, end: e };
}

/** Every fard, nafl and prohibited window in the day, in chronological order. */
export function buildPrayerTimeline(
  times: PrayerTimes,
  lang: Lang,
  tx: (bn: string) => string
): Period[] {
  const nafl = getNaflWindows(times);
  const sunset = times.sunset;
  const asrEnd = sunset && sunset !== times.maghrib ? sunset : times.maghrib;
  const rows: Period[] = [
    {
      key: "fajr",
      name: prayerName("fajr", lang),
      kind: "fard",
      icon: "sunrise",
      start: times.fajr,
      end: times.sunrise,
    },
    {
      key: "sunrise",
      name: prayerName("sunrise", lang),
      kind: "prohibited",
      icon: "sun",
      start: times.sunrise,
      end: addMinutes(times.sunrise, 15),
    },
  ];

  if (nafl) {
    rows.push(
      {
        key: "ishraq",
        name: tx("ইশরাক"),
        kind: "nafl",
        icon: "sunrise",
        start: nafl.ishraqStart,
        end: nafl.ishraqEnd,
      },
      {
        key: "chasht",
        name: tx("চাশত"),
        kind: "nafl",
        icon: "sun",
        start: nafl.chashtStart,
        end: nafl.chashtEnd,
      }
    );
  }

  rows.push(
    {
      key: "zawal",
      name: tx("যাওয়াল"),
      kind: "prohibited",
      icon: "sun",
      start: addMinutes(times.dhuhr, -10),
      end: times.dhuhr,
    },
    {
      key: "dhuhr",
      name: prayerName("dhuhr", lang),
      kind: "fard",
      icon: "sun",
      start: times.dhuhr,
      end: times.asr,
    },
    {
      key: "asr",
      name: prayerName("asr", lang),
      kind: "fard",
      icon: "sun",
      start: times.asr,
      end: asrEnd,
    }
  );

  if (sunset && sunset !== times.maghrib) {
    rows.push({
      key: "sunset",
      name: tx("সূর্যাস্ত"),
      kind: "prohibited",
      icon: "sunset",
      start: sunset,
      end: times.maghrib,
    });
  }

  rows.push(
    {
      key: "maghrib",
      name: prayerName("maghrib", lang),
      kind: "fard",
      icon: "sunset",
      start: times.maghrib,
      end: times.isha,
    },
    {
      key: "awwabin",
      name: tx("আউওয়াবীন"),
      kind: "nafl",
      icon: "star",
      start: addMinutes(times.maghrib, 10),
      end: times.isha,
    },
    {
      key: "isha",
      name: prayerName("isha", lang),
      kind: "fard",
      icon: "moon",
      start: times.isha,
      end: times.fajr,
      endTomorrow: true,
    },
    {
      key: "tahajjud",
      name: tx("তাহাজ্জুদ"),
      kind: "nafl",
      icon: "moon",
      start: times.isha,
      end: times.fajr,
      endTomorrow: true,
      note: tx("বাদ এশা থেকে ফজর পর্যন্ত"),
    }
  );

  return rows.filter((row) => toMinutes(row.end) !== toMinutes(row.start));
}

/** Minutes since midnight, with seconds as a fraction. */
function nowMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}

/** The period running right now (wraps past midnight). */
export function findCurrentPeriod(timeline: Period[], now: Date): Period | null {
  const nowM = nowMinutes(now);
  for (const period of timeline) {
    const range = periodRange(period.start, period.end);
    if (
      (nowM >= range.start && nowM < range.end) ||
      (nowM + 1440 >= range.start && nowM + 1440 < range.end)
    ) {
      return period;
    }
  }
  return null;
}

/** The next period to start, today or tomorrow. */
export function findNextPeriod(timeline: Period[], now: Date): Period | null {
  const nowM = nowMinutes(now);
  let best: Period | null = null;
  let bestStart = Number.POSITIVE_INFINITY;
  for (const period of timeline) {
    const start = toMinutes(period.start);
    const occurrence = start <= nowM ? start + 1440 : start;
    if (occurrence < bestStart) {
      bestStart = occurrence;
      best = period;
    }
  }
  return best;
}

/** Seconds left until the period ends. */
export function periodRemainingSec(period: Period, now: Date): number {
  const range = periodRange(period.start, period.end);
  const nowM = nowMinutes(now);
  const current = nowM < range.start ? nowM + 1440 : nowM;
  return Math.max(0, Math.round((range.end - current) * 60));
}
