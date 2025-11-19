import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.connorbelanger.twinpeakin',
  appName: 'Twinpeakin',
  webDir: 'dist/public',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
