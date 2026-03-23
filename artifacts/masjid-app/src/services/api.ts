import type { Masjid, Visit, PopularTimesData, OverpassResponse, PrayerTimings } from '../types';
import {
  SEARCH_RADIUS, VISIT_COOLDOWN,
  VISITS_KEY, LAST_VISIT_KEY, USER_ID_KEY, PRAYER_SLOTS, DEMO_MASJIDS,
} from '../constants';

export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildAddress(tags: Record<string, string>, lat: number, lon: number): string {
  const parts: string[] = [];
  if (tags['addr:housenumber'] && tags['addr:street']) {
    parts.push(`${tags['addr:housenumber']} ${tags['addr:street']}`);
  } else if (tags['addr:street']) {
    parts.push(tags['addr:street']);
  }
  if (tags['addr:suburb'] || tags['addr:neighbourhood']) {
    parts.push(tags['addr:suburb'] || tags['addr:neighbourhood']);
  }
  if (tags['addr:city'] || tags['addr:town'] || tags['addr:village']) {
    parts.push(tags['addr:city'] || tags['addr:town'] || tags['addr:village']);
  }
  if (tags['addr:state']) parts.push(tags['addr:state']);
  if (parts.length > 0) return parts.join(', ');
  return `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
}

const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

async function queryOverpass(query: string): Promise<OverpassResponse> {
  const url = `${OVERPASS_MIRRORS[0]}?data=${encodeURIComponent(query)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 18000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`status ${res.status}`);
    return res.json();
  } catch {
    clearTimeout(timer);
    for (const mirror of OVERPASS_MIRRORS.slice(1)) {
      try {
        const r = await fetch(`${mirror}?data=${encodeURIComponent(query)}`);
        if (r.ok) return r.json();
      } catch { /* try next */ }
    }
    throw new Error('All Overpass mirrors failed');
  }
}

export async function fetchNearbyMasjids(lat: number, lon: number): Promise<Masjid[]> {
  const query = `[out:json][timeout:18];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS},${lat},${lon});way["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS},${lat},${lon});relation["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS},${lat},${lon}););out center body;`;

  const data = await queryOverpass(query);

  const masjids: Masjid[] = data.elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (!elLat || !elLon) return null;

      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || tags['name:ur'] || tags['name:ar'] || 'Masjid';
      const address = buildAddress(tags, elLat, elLon);

      return {
        id: `osm_${el.type}_${el.id}`,
        name,
        address,
        lat: elLat,
        lon: elLon,
        distance: Math.round(calculateDistance(lat, lon, elLat, elLon)),
      };
    })
    .filter((m): m is Masjid => m !== null)
    .sort((a, b) => a.distance - b.distance);

  return masjids;
}

export function logVisit(masjidId: string): boolean {
  const userId = getUserId();
  const now = Date.now();
  const lastVisits: Record<string, number> = JSON.parse(localStorage.getItem(LAST_VISIT_KEY) || '{}');
  if (now - (lastVisits[masjidId] || 0) < VISIT_COOLDOWN) return false;
  const visits: Visit[] = JSON.parse(localStorage.getItem(VISITS_KEY) || '[]');
  visits.push({ masjid_id: masjidId, timestamp: now, user_id: userId });
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  localStorage.setItem(VISITS_KEY, JSON.stringify(visits.filter((v) => v.timestamp > thirtyDaysAgo)));
  lastVisits[masjidId] = now;
  localStorage.setItem(LAST_VISIT_KEY, JSON.stringify(lastVisits));
  return true;
}

export function getPopularTimes(masjidId: string): PopularTimesData {
  const visits: Visit[] = JSON.parse(localStorage.getItem(VISITS_KEY) || '[]');
  const masjidVisits = visits.filter((v) => v.masjid_id === masjidId);
  const slotCounts: Record<string, number> = {};
  PRAYER_SLOTS.forEach((s) => (slotCounts[s.name] = 0));

  masjidVisits.forEach((visit) => {
    const date = new Date(visit.timestamp);
    const hour = date.getHours();
    const day = date.getDay();
    PRAYER_SLOTS.forEach((slot) => {
      if (hour >= slot.startHour && hour < slot.endHour) {
        if (slot.name === 'jummah') { if (day === 5) slotCounts[slot.name]++; }
        else if (slot.name === 'dhuhr' && day === 5) slotCounts['jummah']++;
        else slotCounts[slot.name]++;
      }
    });
  });

  const maxCount = Math.max(...Object.values(slotCounts), 1);
  const hasRealData = masjidVisits.length > 0;

  const slots = PRAYER_SLOTS.map((slot) => {
    let count = slotCounts[slot.name];
    let percentage: number;
    if (!hasRealData) {
      const demos: Record<string, number> = {
        fajr: 25 + Math.floor(Math.random() * 30),
        dhuhr: 40 + Math.floor(Math.random() * 35),
        asr: 35 + Math.floor(Math.random() * 30),
        maghrib: 55 + Math.floor(Math.random() * 35),
        isha: 45 + Math.floor(Math.random() * 30),
        jummah: 75 + Math.floor(Math.random() * 25),
      };
      percentage = demos[slot.name] || 50;
      count = Math.floor(percentage / 10);
    } else {
      percentage = Math.round((count / maxCount) * 100);
    }
    const level: 'low' | 'medium' | 'high' | 'very_high' =
      percentage <= 25 ? 'low' : percentage <= 50 ? 'medium' : percentage <= 75 ? 'high' : 'very_high';
    return { name: slot.name, label: slot.label, icon: slot.icon, count, percentage, level };
  });

  return {
    masjid_id: masjidId,
    slots,
    totalVisits: hasRealData ? masjidVisits.length : slots.reduce((a, s) => a + s.count, 0),
    lastUpdated: Date.now(),
  };
}

export function getVisitCount(masjidId: string): number {
  const visits: Visit[] = JSON.parse(localStorage.getItem(VISITS_KEY) || '[]');
  return visits.filter((v) => v.masjid_id === masjidId).length;
}

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
}

export async function fetchPrayerTimes(lat: number, lon: number): Promise<PrayerTimings> {
  const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=1&school=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Prayer times unavailable');
  const json = await res.json();
  const t = json.data.timings;
  const d = json.data.date;
  return {
    Fajr: t.Fajr,
    Sunrise: t.Sunrise,
    Dhuhr: t.Dhuhr,
    Asr: t.Asr,
    Sunset: t.Sunset,
    Maghrib: t.Maghrib,
    Isha: t.Isha,
    date: d.readable,
    hijriDate: d.hijri.day,
    hijriMonth: d.hijri.month.en,
    hijriYear: d.hijri.year,
  };
}

export function calculateQibla(lat: number, lon: number): number {
  const MECCA_LAT = 21.4225;
  const MECCA_LON = 39.8262;
  const lat1 = (lat * Math.PI) / 180;
  const lat2 = (MECCA_LAT * Math.PI) / 180;
  const dLon = ((MECCA_LON - lon) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export function distanceToMecca(lat: number, lon: number): number {
  return Math.round(calculateDistance(lat, lon, 21.4225, 39.8262) / 1000);
}
