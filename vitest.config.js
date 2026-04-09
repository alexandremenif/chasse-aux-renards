import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' }
      ],
      headless: true
    },
    coverage: {
      provider: 'istanbul',
      include: ['src/**'],
      exclude: ['src/main.js'],
      reporter: ['text', 'html', 'clover']
    }
  }
});
