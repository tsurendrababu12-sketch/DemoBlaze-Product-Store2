import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testMatch: 'live-demo.spec.ts',
  fullyParallel: false,
  timeout: 120_000,
  retries: 0,
  workers: 1,
  use: {
    ...baseConfig.use,
    launchOptions: {
      slowMo: 3_000,
    },
  },
});
