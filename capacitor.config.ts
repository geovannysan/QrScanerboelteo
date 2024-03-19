import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'www.example.com.ec',
  appName: 'QRScaner',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
