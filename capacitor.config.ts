import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.connorbelanger.twinpeakin',
  appName: 'Twinpeakin',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
