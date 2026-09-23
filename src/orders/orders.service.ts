import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async createOrder(customerId: string, dto: CreateOrderDto) {
    // Verify menu items
    const menuItemIds = dto.items.map(i => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId: dto.restaurantId,
        isAvailable: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('One or more items are invalid or unavailable');
    }

    const itemMap = new Map(menuItems.map(m => [m.id, m]));

    // Create order
    const order = await this.prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          customerId,
          restaurantId: dto.restaurantId,
          deliveryAddress: dto.deliveryAddress,
          status: 'PENDING',
          items: {
            create: dto.items.map(item => {
              const snapshot = itemMap.get(item.menuItemId)!;
              return {
                menuItemId: item.menuItemId,
                name: snapshot.name,
                price: snapshot.price,
                quantity: item.quantity,
              };
            }),
          },
        },
        include: { items: true },
      });
    });

    return { orderId: order.id, status: order.status, total: dto.items.reduce((sum, item) => sum + (itemMap.get(item.menuItemId)!.price * item.quantity), 0) };
  }

  async getOrderById(customerId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        restaurant: { select: { name: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }
}