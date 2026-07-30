import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.coupleplanner.app',
  appName: 'CouplePlanner',
  webDir: 'out',
  server: {
    url: 'https://nextjs1-git-main-truong177.vercel.app/',
    cleartext: true,
    allowNavigation: [
      "nextjs1-git-main-truong177.vercel.app",
      "*.vercel.app"
    ]
  }
};

export default config;
