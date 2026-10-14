import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tools/playwright',
  testMatch: '**/*.spec.mjs',
  outputDir: '.test-artifacts/playwright/results',
  workers: 1,
  timeout: 30000,
  reporter: [['list'], ['html', { outputFolder: '.test-artifacts/playwright/report', open: 'never' }]],
  use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:4173',
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'escritorio', use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
    { name: 'movil', use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true } },
    { name: 'movil-estrecho', use: { viewport: { width: 320, height: 740 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true } }
  ]
});
