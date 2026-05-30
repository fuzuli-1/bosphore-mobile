import type { CapacitorConfig } from '@capacitor/cli';

 const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'bosphoremobile',
  webDir: 'www',
  server: {
    cleartext: true,        // ← HTTP'ye izin ver
    androidScheme: 'http'  // ← https yerine http kullan
  }
};

export default config;
