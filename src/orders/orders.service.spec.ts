import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UnprocessableEntityException, ForbiddenException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';

const mockPrisma: any = {
  menuItem: { findMany: jest.fn() },
  order: { create: jest.fn(), findUnique: jest.fn() },
  $transaction: jest.fn(),
};


describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  const validPayload: CreateOrderDto = {
    restaurantId: 'rest-1',
    items: [
      {
        menuItemId: 'item-1',
        quantity: 2
      }
    ],
    deliveryAddress: {
      street: '12 Jalan Kemboja',
      city: 'Kota Bharu',
      postcode: '16150',
      phone: '+60123456789'
    },
  };

  const currentUser = { id: 'user-1', role: 'CUSTOMER' };

  it('createOrder: creates order with PENDING status and price snapshot', async () => {
    mockPrisma.menuItem.findMany.mockResolvedValue([
      {
        id: 'item-1',
        restaurantId: 'rest-1',
        price: 32.00, name: 'Chicken'
      },
    ]);
    mockPrisma.$transaction.mockImplementation(async (fn) =>
      fn(mockPrisma)
    );
    mockPrisma.order.create.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'OMB-00001',
      status: 'PENDING',
      total: 64.00,
    });

    const result = await service.createOrder(currentUser.id, validPayload);

    expect(result.status).toBe('PENDING');
    const createArgs = mockPrisma.order.create.mock.calls[0][0];
    expect(createArgs.data.items.create[0].price).toBe(32.00);
  });

  it('createOrder: throws UnprocessableEntityException if item belongs to different restaurant', async () => {
    mockPrisma.menuItem.findMany.mockResolvedValue([
      { id: 'item-1', restaurantId: 'rest-OTHER', price: 32.00 },
    ]);

    await expect(service.createOrder(currentUser.id, validPayload)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('createOrder: throws UnprocessableEntityException if requested item is not found', async () => {
    mockPrisma.menuItem.findMany.mockResolvedValue([]);

    await expect(service.createOrder(currentUser.id, validPayload)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('getOrderById: throws ForbiddenException if accessed by a different user', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      customerId: 'user-OTHER',
      status: 'PENDING',
    });

    await expect(service.getOrderById(currentUser.id, 'order-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('getOrderById: returns order when accessed by its owner', async () => {
    const order = { id: 'order-1', customerId: 'user-1', status: 'PENDING', orderItems: [] };
    mockPrisma.order.findUnique.mockResolvedValue(order);

    const result = await service.getOrderById(currentUser.id, 'order-1');

    expect(result.id).toBe('order-1');
  });
});
