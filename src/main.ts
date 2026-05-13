// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // PERBAIKAN: Aktifkan CORS agar Frontend bisa akses
  app.enableCors({
    origin: 'http://localhost:3000', // Port frontend Anda
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3001); // Jalankan di port 3001
}
bootstrap();