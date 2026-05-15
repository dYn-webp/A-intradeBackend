import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Baca file .env
dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;

    // 1. Pengecekan (Tanpa menggunakan 'this')
    if (!dbUrl) {
      throw new Error('❌ GAGAL: DATABASE_URL kosong! Pastikan file .env ada dan tersimpan.');
    }

    if (dbUrl.startsWith('ENC[')) {
      throw new Error('❌ GAGAL: URL Anda masih terenkripsi oleh dotenvx! Harap gunakan teks biasa di file .env');
    }

    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      throw new Error(`❌ GAGAL: Format URL salah! URL Anda saat ini terbaca sebagai: "${dbUrl.substring(0, 15)}..." (Harus dimulai dengan postgresql://)`);
    }

    // 2. Buat koneksi PostgreSQL
    const pool = new Pool({
      connectionString: dbUrl,
    });
    const adapter = new PrismaPg(pool);
    
    // 3. WAJIB PANGGIL SUPER() TERLEBIH DAHULU
    super({ adapter } as any);

    // 4. Setelah super() dipanggil, barulah kita boleh memakai 'this'
    this.logger.log('✅ URL Database valid, mencoba mengkoneksikan ke Supabase...');
  }

  async onModuleInit() {
    await this.$connect();
  }
}