import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';

import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { User } from '../generated/prisma/index.js';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role?: string;
  };
  headers: {
    authorization: string;
    [key: string]: string | string[] | undefined;
  };
}

interface RequestWithLoginUser {
  user: Omit<User, 'passwordHash'>; // User object from LocalStrategy
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request (validation failed).' })
  @ApiResponse({ status: 409, description: 'Conflict (Email already in use).' })
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'password123' }
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Return JWT access token.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Request() req: RequestWithLoginUser) {
    return this.authService.login(req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Return success message.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout() {
    return this.authService.logout();
  }  

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}