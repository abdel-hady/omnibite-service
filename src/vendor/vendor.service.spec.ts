import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { VendorService } from './vendor.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';

const mockPrisma: any = {
  order: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('VendorService', () => {
  let service: VendorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VendorService>(VendorService);
    jest.clearAllMocks();
  });

  const vendorUser = { id: 'vendor-1', restaurantId: 'rest-1', role: 'RESTAURANT' };

  it(`getOrders: returns only orders scoped to the vendor's restaurant`, async () => {
    const orders = [
      { id: 'o1', restaurantId: 'rest-1' },
      { id: 'o2', restaurantId: 'rest-1' },
    ];
    mockPrisma.order.findMany.mockResolvedValue(orders);

    const result = await service.getOrders(vendorUser.restaurantId);

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { restaurantId: 'rest-1' },
      }),
    );
    expect(result).toHaveLength(2);
  });

  it('updateOrderStatus: advances PENDING → CONFIRMED successfully', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'o1',
      restaurantId: 'rest-1',
      status: 'PENDING',
    });
    mockPrisma.order.update.mockResolvedValue({ id: 'o1', status: 'CONFIRMED' });

    const result = await service.updateOrderStatus('o1', vendorUser.restaurantId, 'CONFIRMED');

    expect(result.status).toBe('CONFIRMED');
  });

  it('updateOrderStatus: throws UnprocessableEntityException for backward transition', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'o1',
      restaurantId: 'rest-1',
      status: 'CONFIRMED',
    });

    await expect(service.updateOrderStatus('o1', vendorUser.restaurantId, 'PENDING')).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('updateOrderStatus: throws ForbiddenException for order from another restaurant', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'o1',
      restaurantId: 'rest-OTHER',
      status: 'PENDING',
    });

    await expect(service.updateOrderStatus('o1', vendorUser.restaurantId, 'CONFIRMED')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
