export interface Masjid {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distance: number;
}

export interface Visit {
  masjid_id: string;
  timestamp: number;
  user_id: string;
}

export interface PrayerSlot {
  name: string;
  label: string;
  icon: string;
  startHour: number;
  endHour: number;
  dayOnly?: number;
}

export interface PopularTimesData {
  masjid_id: string;
  slots: {
    name: string;
    label: string;
    icon: string;
    count: number;
    percentage: number;
    level: 'low' | 'medium' | 'high' | 'very_high';
  }[];
  totalVisits: number;
  lastUpdated: number;
}

export interface UserLocation {
  lat: number;
  lon: number;
  accuracy: number;
  timestamp: number;
}

export type Screen = 'splash' | 'home' | 'detail' | 'timings' | 'qibla' | 'quran' | 'quran-reader';
export type TabId = 'home' | 'timings' | 'qibla' | 'quran';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  date: string;
  hijriDate: string;
  hijriMonth: string;
  hijriYear: string;
}

export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface QuranAyah {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  version: number;
  elements: OverpassElement[];
}
