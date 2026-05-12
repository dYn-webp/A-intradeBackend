// prisma.config.ts
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: {
    kind: 'local',
    path: 'prisma/schema.prisma',
  },
  migrate: {
    // Di sini kita panggil URL dari .env
    url: process.env.DATABASE_URL,
  },
});