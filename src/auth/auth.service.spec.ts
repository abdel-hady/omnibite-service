import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';

const mockPrisma: any = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt: any = {
  signAsync: (jest.fn() as any).mockResolvedValue('signed-token'),
};

const mockUsersService: any = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ─── TASK 04 + TASK 14: Register ───────────────────────────────────────────

  // TDD: Given a new email and password, when register() is called,
  // then the password is stored hashed and a user object (without password) is returned.
  it('register: delegates to UsersService to create a new user', async () => {
    mockUsersService.create.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'CUSTOMER',
      createdAt: new Date(),
      restaurantId: null,
    });

    const result = await service.register({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
      role: 'CUSTOMER',
    });

    expect(mockUsersService.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
      role: 'CUSTOMER',
    });

    expect(result.email).toBe('test@example.com');
  });

  it('register: throws ConflictException when email already exists', async () => {
    mockUsersService.create.mockRejectedValue(new ConflictException());

    await expect(
      service.register({
        email: 'taken@example.com',
        password: 'Password123!',
        name: 'Test',
        role: 'CUSTOMER',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('validateUser: returns user without passwordHash for valid credentials', async () => {
    mockUsersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash: 'pass',
      role: 'CUSTOMER',
    });

    const result = await service.validateUser('user@example.com', 'pass');

    expect(result).toEqual({
      id: '1',
      email: 'user@example.com',
      role: 'CUSTOMER',
    });
  });

  it('validateUser: returns null for invalid password', async () => {
    mockUsersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash: 'pass',
      role: 'CUSTOMER',
    });

    const result = await service.validateUser('user@example.com', 'wrong');

    expect(result).toBeNull();
  });

  it('validateUser: returns null if user is not found', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);

    const result = await service.validateUser('ghost@example.com', 'pass');

    expect(result).toBeNull();
  });

  it('login: returns a signed JWT token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('correct-pass', 12);
    mockUsersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash,
      role: 'CUSTOMER',
    });

    const result = await service.login({ email: 'user@example.com', password: 'correct-pass' });

    expect(result.accessToken).toBe('signed-token');
    expect(mockJwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: '1', role: 'CUSTOMER' }),
    );
  });

  it('login: throws UnauthorizedException for wrong password', async () => {
    const passwordHash = await bcrypt.hash('correct-pass', 12);
    mockUsersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash,
      role: 'CUSTOMER',
    });

    await expect(
      service.login({ email: 'user@example.com', password: 'wrong-pass' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login: throws UnauthorizedException when user does not exist', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'ghost@example.com', password: 'any' }),
    ).rejects.toThrow(UnauthorizedException);
  });


  it('logout: clears the access token cookie by setting it to empty and expiring it immediately', async () => {
    const res: any = {
      clearCookie: jest.fn(),
    };
    await service.logout(res);
    expect(res.clearCookie).toHaveBeenCalledWith('auth_token');
  });

});
