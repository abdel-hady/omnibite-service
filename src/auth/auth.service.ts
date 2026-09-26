import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { User } from '../generated/prisma/index.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto.js';
import express from 'express';
import { RestaurantsService } from '../restaurants/restaurants.service.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private restaurantsService: RestaurantsService,
    private jwtService: JwtService
  ) { }

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);

    if (dto.role && dto.role === 'RESTAURANT') {
      const restaurant = await this.restaurantsService.create({ name: dto.restaurantName!, slug: dto.restaurantName!.toLowerCase().replace(' ', '-'), ownerId: user.id })
      // now link manager with restaurant using restaurantId
      const manager = await this.usersService.update(user.id, { restaurantId: restaurant.id }, user.id, 'ADMIN')
      return manager;
    }

    return user;
  }

  // TODO: send roles, id, name, email, and other required fields
  async validateUser(email: string, pass: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.passwordHash === pass) {

      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);

    const { passwordHash, ...safeUser } = user;
    return { accessToken: token, user: safeUser };
  }

  async logout(res: express.Response): Promise<{ message: string }> {
    res.clearCookie('auth_token');
    return { message: 'Logged out successfully' };
  }
}