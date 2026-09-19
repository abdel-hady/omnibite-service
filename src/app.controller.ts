
import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { LocalAuthGuard } from './auth/guards/local-auth.guard.js';
import { AuthService } from './auth/auth.service.js';

interface RequestWithUser {
  user: {
    userId: string;
    username: string;
    role?: string;
  };
}

interface RequestWithLoginUser {
  user: {
    username: string;
    password: string;
    role?: string;
  };
}

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req: RequestWithLoginUser) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
