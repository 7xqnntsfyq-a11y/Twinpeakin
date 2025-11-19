import { CapacitorConfig } from '@capacitor/core';

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
