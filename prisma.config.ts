// prisma.config.ts
import { defineConfig, env } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  // PERBAIKAN: Schema harus berupa string langsung, bukan objek!
  schema: 'prisma/schema.prisma',
  
  // PERBAIKAN: Menggunakan 'datasource', bukan 'migrate'
  datasource: {
    url: env('DATABASE_URL'),
  },
});