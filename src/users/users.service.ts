import { Injectable } from '@nestjs/common';

import { Role } from '../auth/decorators/roles.decorator.js';

export type User = { userId: string; username: string; password?: string; refreshToken?: string | null; role?: Role };

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      userId: '1',
      username: 'john',
      password: 'changeme',
      role: Role.Admin,
    },
    {
      userId: '2',
      username: 'maria',
      password: 'guess',
      role: Role.UserCustomer,
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async findById(userId: string): Promise<User | undefined> {
    return this.users.find(user => user.userId === userId);
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const user = this.users.find(u => u.userId === userId);
    if (user) {
      user.refreshToken = refreshToken;
    }
  }
}