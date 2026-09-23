import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service.js';
import { VendorController } from './vendor.controller.js';

@Module({
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}
