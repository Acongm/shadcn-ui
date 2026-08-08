import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const file = (relativePath) => fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@/lib/ui-cn': file('./registry/acongm/lib/ui-cn.ts'),
      '@/lib/theme': file('./registry/acongm/lib/theme.ts'),
      '@/components/ui/button': file('./registry/acongm/ui/button.tsx'),
      '@/components/ui/label': file('./registry/acongm/ui/label.tsx'),
      '@/components/ui/separator': file('./registry/acongm/ui/separator.tsx'),
    },
  },
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'https://portal.acongm.com/' } },
    setupFiles: ['./tests/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
});
