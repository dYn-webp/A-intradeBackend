import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Mesin A\'INTRADE Berjalan Normal!';
  }

  getCurrentPrice(symbol: string) {
  // Simulasi harga emas yang fluktuatif sedikit
  const basePrice = symbol === 'XAUUSD' ? 1450.25 : 100.00;
  const volatility = (Math.random() - 0.5) * 2; // Random naik turun
  return basePrice + volatility;
  }

  // === FUNGSI PROFIL & AUTOSEED ===
  async getProfile() {
    let user = await this.prisma.user.findFirst({
      include: { tradingAccounts: true, investmentAccounts: true },
    });

    // Seeding Otomatis jika database kosong
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: 'admin@aintrade.com',
          password: 'hashed_password_rahasia', 
          fullName: 'Adinda Ardiansyah',
          walletBalance: 1500000, // Modal Utama di Dompet
          currency: 'IDR',
          tradingAccounts: {
            create: {
              tradingId: 'T-' + Math.floor(10000 + Math.random() * 90000),
              currentBalance: 540000,
              leverage: '1:500',
              status: 'ACTIVE',
            },
          },
          investmentAccounts: {
            create: {
              investId: 'I-' + Math.floor(10000 + Math.random() * 90000),
              currentBalance: 0,
              status: 'ACTIVE',
            }
          }
        },
        include: { tradingAccounts: true, investmentAccounts: true },
      });
    }

    return {
      id: user.id,
      fullName: user.fullName,
      walletBalance: user.walletBalance,
      tradingAccount: user.tradingAccounts[0],
      investAccount: user.investmentAccounts[0],
    };
  }

  // === FUNGSI UTAMA UNTUK SWAP / TRANSFER DANA ===
  async transferFunds(userId: string, from: 'MAIN' | 'TRADING' | 'INVEST', to: 'MAIN' | 'TRADING' | 'INVEST', amount: number) {
    if (amount <= 0) throw new BadRequestException('Jumlah transfer tidak valid');
    if (from === to) throw new BadRequestException('Sumber dan tujuan tidak boleh sama');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tradingAccounts: true, investmentAccounts: true }
    });

    if (!user) throw new BadRequestException('User tidak ditemukan');

    const tradingAccount = user.tradingAccounts[0];
    const investAccount = user.investmentAccounts[0];

    // 1. Cek ketersediaan saldo
    let hasEnoughBalance = false;
    if (from === 'MAIN') hasEnoughBalance = user.walletBalance >= amount;
    else if (from === 'TRADING') hasEnoughBalance = tradingAccount.currentBalance >= amount;
    else if (from === 'INVEST') hasEnoughBalance = investAccount.currentBalance >= amount;

    if (!hasEnoughBalance) throw new BadRequestException('Saldo tidak mencukupi untuk transfer');

    // 2. Lakukan Eksekusi Pemindahan (Prisma Transaction)
    return await this.prisma.$transaction(async (tx) => {
      // Kurangi dari Sumber
      if (from === 'MAIN') await tx.user.update({ where: { id: userId }, data: { walletBalance: { decrement: amount } } });
      else if (from === 'TRADING') await tx.tradingAccount.update({ where: { id: tradingAccount.id }, data: { currentBalance: { decrement: amount } } });
      else if (from === 'INVEST') await tx.investmentAccount.update({ where: { id: investAccount.id }, data: { currentBalance: { decrement: amount } } });

      // Tambahkan ke Tujuan
      if (to === 'MAIN') await tx.user.update({ where: { id: userId }, data: { walletBalance: { increment: amount } } });
      else if (to === 'TRADING') await tx.tradingAccount.update({ where: { id: tradingAccount.id }, data: { currentBalance: { increment: amount } } });
      else if (to === 'INVEST') await tx.investmentAccount.update({ where: { id: investAccount.id }, data: { currentBalance: { increment: amount } } });

      return { success: true, message: `Berhasil memindahkan Rp ${amount} dari ${from} ke ${to}` };
    });
  }

  // === MESIN B-BOOK: FUNGSI BUKA POSISI (BUY/SELL) ===
  async openTrade(userId: string, symbol: string, orderType: 'BUY' | 'SELL', lotSize: number, openPrice: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tradingAccounts: true }
    });

    if (!user || user.tradingAccounts.length === 0) {
      throw new BadRequestException('Akun trading tidak ditemukan');
    }

    const tradingAccount = user.tradingAccounts[0];

    // Simulasi Cek Margin (Asumsi 1 Lot butuh margin Rp 50.000)
    const requiredMargin = lotSize * 50000; 
    if (tradingAccount.currentBalance < requiredMargin) {
      throw new BadRequestException(`Margin tidak cukup. Butuh minimal Rp ${requiredMargin} untuk ${lotSize} Lot.`);
    }

    // Eksekusi: Masukkan ke Buku Order
    const newOrder = await this.prisma.tradeOrder.create({
      data: {
        tradingAccountId: tradingAccount.id,
        symbol: symbol,
        orderType: orderType,
        lotSize: lotSize,
        openPrice: openPrice,
        status: 'OPEN',
      }
    });

    return { 
      success: true, 
      message: `Posisi ${orderType} ${symbol} (${lotSize} Lot) Berhasil Dibuka!`,
      order: newOrder
    };
  }

  // === MESIN B-BOOK: TARIK DATA POSISI AKTIF ===
  async getActiveTrades(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tradingAccounts: true }
    });

    if (!user || user.tradingAccounts.length === 0) return [];

    // Cari semua order yang statusnya masih OPEN
    return await this.prisma.tradeOrder.findMany({
      where: {
        tradingAccountId: user.tradingAccounts[0].id,
        status: 'OPEN'
      },
      orderBy: { openTime: 'desc' }
    });
  }
}