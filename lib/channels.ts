/**
 * Channel registry — ported from the `master` branch (`src/lib/channels.ts`),
 * which is the stable channel implementation.
 * IDs verified via the YouTube Data API (`channels.forHandle`).
 */
export interface AppChannel {
  id: string;
  handle: string;
  name: string;
  /** Friendly Bengali label for the Bengali-first UI. */
  nameBn: string;
}

export const CHANNELS: AppChannel[] = [
  { id: "UC8NjCrYUV5YrpK2j6XTwGSA", handle: "@islahbd", name: "Islah", nameBn: "ইসলাহ" },
  { id: "UCZVVdlwGUDNwLF0Dqr9Klew", handle: "@IslahiGhazal", name: "Islahi Ghazal", nameBn: "ইসলামী গজল" },
];

export const DEFAULT_CHANNEL_ID = CHANNELS[0].id;

export function getChannelById(id: string): AppChannel {
  return CHANNELS.find((c) => c.id === id) ?? CHANNELS[0];
}
