import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Wajib ada rute ini agar frontend bisa memanggil data
  @Get('user/profile')
  async getProfile() {
    return this.appService.getProfile();
  }
}