import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Pastikan file .env terbaca
dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Di Prisma 7, kita WAJIB menggunakan Driver Adapter
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }
}