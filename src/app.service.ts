import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  // 1. Suntikkan PrismaService ke dalam AppService
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Mesin A\'INTRADE Berjalan Normal!';
  }

  // 2. Fungsi utama untuk mengambil data profil ke Dashboard Frontend
  async getProfile() {
    // Cari user pertama di database
    let user = await this.prisma.user.findFirst({
      include: { accounts: true },
    });

    // Jika database kosong, sistem akan otomatis membuatkan data awal (Seeding)
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: 'admin@aintrade.com',
          password: 'hashed_password_rahasia', 
          fullName: 'Adinda Ardiansyah',
          walletBalance: 150000,
          currency: 'IDR',
          accounts: {
            create: {
              type: 'MICRO_CHALLENGE',
              initialBalance: 500000,
              currentBalance: 540000, // Simulasi profit 40rb
              profitTarget: 40000,
              maxLoss: 50000,
              status: 'ACTIVE',
            },
          },
        },
        include: { accounts: true },
      });
    }

    // 3. Format balikan data (Response) agar pas dibaca oleh Frontend Next.js
    return {
      fullName: user.fullName,
      walletBalance: user.walletBalance,
      tradingAccount: user.accounts[0] || {
        currentBalance: 0,
        initialBalance: 0,
        profitTarget: 0,
        maxLoss: 0,
        status: 'NONE',
      },
    };
  }
}