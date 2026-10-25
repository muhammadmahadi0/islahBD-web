export const KAABA = { lat: 21.4225, lng: 39.8262 };

/** Normalize degrees to 0..360. */
export function norm(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Great-circle bearing from the user to the Kaaba (degrees clockwise from North). */
export function kaabaBearing(lat: number, lng: number): number {
  const la1 = (lat * Math.PI) / 180;
  const lo1 = (lng * Math.PI) / 180;
  const la2 = (KAABA.lat * Math.PI) / 180;
  const lo2 = (KAABA.lng * Math.PI) / 180;
  const y = Math.sin(lo2 - lo1);
  const x = Math.cos(la1) * Math.tan(la2) - Math.sin(la1) * Math.cos(lo2 - lo1);
  return norm((Math.atan2(y, x) * 180) / Math.PI);
}

/** Great-circle distance to the Kaaba in kilometres. */
export function kaabaDistanceKm(lat: number, lng: number): number {
  const earthKm = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(KAABA.lat - lat);
  const dLng = toRad(KAABA.lng - lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) * Math.cos(toRad(KAABA.lat)) * Math.sin(dLng / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
