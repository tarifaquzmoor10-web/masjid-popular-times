import type { PrayerSlot } from './types';

export const SEARCH_RADIUS = 5000;
export const VISIT_THRESHOLD = 50;
export const VISIT_COOLDOWN = 30 * 60 * 1000;
export const LOCATION_UPDATE_INTERVAL = 10000;
export const USER_ID_KEY = 'masjid_popular_times_user_id';
export const VISITS_KEY = 'masjid_popular_times_visits';
export const LAST_VISIT_KEY = 'masjid_popular_times_last_visit';

export const PRAYER_SLOTS: PrayerSlot[] = [
  { name: 'fajr', label: 'Fajr', icon: '🌙', startHour: 4, endHour: 6 },
  { name: 'dhuhr', label: 'Dhuhr', icon: '☀️', startHour: 12, endHour: 14 },
  { name: 'asr', label: 'Asr', icon: '🌤️', startHour: 15, endHour: 17 },
  { name: 'maghrib', label: 'Maghrib', icon: '🌅', startHour: 18, endHour: 19 },
  { name: 'isha', label: 'Isha', icon: '🌃', startHour: 20, endHour: 22 },
  { name: 'jummah', label: 'Jummah', icon: '🕌', startHour: 12, endHour: 14, dayOnly: 5 },
];

export const CROWD_LEVELS = {
  low: { max: 25, color: '#22c55e', label: 'Quiet' },
  medium: { max: 50, color: '#eab308', label: 'Moderate' },
  high: { max: 75, color: '#f97316', label: 'Busy' },
  very_high: { max: 100, color: '#ef4444', label: 'Very Busy' },
};

export const DEMO_MASJIDS = [
  { id: 'demo_1', name: 'Mecca Masjid', address: 'Charminar, Ghansi Bazaar, Hyderabad, Telangana 500002', lat: 17.3604, lon: 78.4736, distance: 120 },
  { id: 'demo_2', name: 'Masjid-e-Khair', address: 'Mehdipatnam, Hyderabad, Telangana 500028', lat: 17.3940, lon: 78.4398, distance: 350 },
  { id: 'demo_3', name: 'Masjid Yaqut ul Maashat', address: 'Tolichowki, Hyderabad, Telangana 500008', lat: 17.3916, lon: 78.4063, distance: 780 },
  { id: 'demo_4', name: 'Masjid Al-Irfan', address: 'Banjara Hills, Road No. 12, Hyderabad, Telangana 500034', lat: 17.4126, lon: 78.4449, distance: 1200 },
  { id: 'demo_5', name: 'Masjid Rahmat', address: 'Kondapur, Hyderabad, Telangana 500084', lat: 17.4584, lon: 78.3561, distance: 2100 },
  { id: 'demo_6', name: 'Masjid Noor', address: 'Madhapur, Hi-Tech City, Hyderabad, Telangana 500081', lat: 17.4483, lon: 78.3915, distance: 3400 },
];
