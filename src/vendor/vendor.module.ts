import { forwardRef, Module } from '@nestjs/common';
import { VendorController } from './vendor.controller.js';
import { VendorService } from './vendor.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule { }