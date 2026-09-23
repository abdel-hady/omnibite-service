import { Test, TestingModule } from '@nestjs/testing';
import { VendorController } from './vendor.controller.js';
import { VendorService } from './vendor.service.js';

describe('VendorController', () => {
  let controller: VendorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorController],
      providers: [VendorService],
    }).compile();

    controller = module.get<VendorController>(VendorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
