import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  
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
  
    return { orderId: order.id, status: order.status };
  }
}
