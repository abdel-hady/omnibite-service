import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User, UserRole } from '../generated/prisma/index.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: dto.role ?? UserRole.CUSTOMER,
      },
    });

    return this.sanitize(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map(this.sanitize);
  }

  async update(id: string, dto: UpdateUserDto, requesterId: string, requesterRole: UserRole) {
    const user = await this.findById(id);

    // only admin or the user themselves
    if (requesterRole !== UserRole.ADMIN && requesterId !== user.id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    let passwordHash = user.passwordHash;

    if (dto.password) {
      const isSame = await bcrypt.compare(dto.password, user.passwordHash);
      if (isSame) {
        throw new BadRequestException('New password cannot be the same as your current password');
      }
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        passwordHash,
      },
    });

    return this.sanitize(updated);
  }

  async remove(id: string) {
    await this.findById(id); // throws 404 if not found
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  private sanitize(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}