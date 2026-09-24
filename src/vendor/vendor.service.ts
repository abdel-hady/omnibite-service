import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrderStatus } from '../generated/prisma/index.js';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) { }

  async getOrders(restaurantId: string) {
    return this.prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        customer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateOrderStatus(orderId: string, restaurantId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new NotFoundException('Order not found');
    if (order.restaurantId !== restaurantId) throw new ForbiddenException('Access denied');

    const VALID_TRANSITIONS = {
      PENDING: ['CONFIRMED'],
      CONFIRMED: ['READY'],
      READY: [],
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!VALID_TRANSITIONS[order.status]?.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${status}`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
  }
}