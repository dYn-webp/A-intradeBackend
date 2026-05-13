import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service'; // 1. Pastikan file ini di-import

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService], // 2. Tambahkan PrismaService ke dalam array providers ini
})
export class AppModule {}