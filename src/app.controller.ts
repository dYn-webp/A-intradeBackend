import { Controller, Get, Post, Body, Param } from '@nestjs/common'; // PERBAIKAN: Menambahkan Param di sini
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Rute API: Ambil Data Profil & Saldo
  @Get('user/profile')
  async getProfile() {
    return this.appService.getProfile();
  }

  // Rute API: Menerima Perintah Swap Dana (Internal Transfer)
  @Post('user/transfer')
  async transferFunds(
    @Body() body: { userId: string, from: 'MAIN' | 'TRADING' | 'INVEST', to: 'MAIN' | 'TRADING' | 'INVEST', amount: number }
  ) {
    return this.appService.transferFunds(body.userId, body.from, body.to, body.amount);
  }

  // Rute API: Ambil Harga Market Real-time (Untuk TradingView)
  @Get('market/price/:symbol')
  getPrice(@Param('symbol') symbol: string) {
    return { 
      symbol, 
      price: this.appService.getCurrentPrice(symbol) 
    };
  }

  // Rute API: Buka Posisi Trading (Mesin B-Book)
  @Post('trade/order')
  async openTrade(
    @Body() body: { userId: string, symbol: string, orderType: 'BUY' | 'SELL', lotSize: number, openPrice: number }
  ) {
    return this.appService.openTrade(body.userId, body.symbol, body.orderType, body.lotSize, body.openPrice);
  }

  // Rute API: Tarik Posisi Aktif (Mesin B-Book)
  @Post('trade/active')
  async getActiveTrades(@Body() body: { userId: string }) {
    return this.appService.getActiveTrades(body.userId);
  }
}