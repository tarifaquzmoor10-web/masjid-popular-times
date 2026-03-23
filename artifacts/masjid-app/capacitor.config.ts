import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.masjidpopulartimes.app',
  appName: 'Masjid Popular Times',
  webDir: 'dist/android',
  plugins: {
    Geolocation: {
      permissions: ['coarse', 'fine'],
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
