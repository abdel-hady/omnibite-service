import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RestaurantQueryDto } from './dto/restaurant-query.dto.js';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: RestaurantQueryDto) {
    const { cuisine, page = 1, limit = 12 } = query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(cuisine ? { cuisine: { contains: cuisine, mode: 'insensitive' as const } } : {}),
    };

    const [restaurants, total] = await this.prisma.$transaction([
      this.prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          cuisine: true,
          rating: true,
          deliveryMin: true,
          deliveryMax: true,
          bannerImage: true,
        },
        orderBy: { rating: 'desc' },
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return {
      data: restaurants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { category: 'asc' },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant "${slug}" not found`);
    }

    // Group menu items by category
    const menuByCategory = restaurant.menuItems.reduce(
      (acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, typeof restaurant.menuItems>,
    );

    return {
      id: restaurant.id,
      slug: restaurant.slug,
      name: restaurant.name,
      description: restaurant.description,
      cuisine: restaurant.cuisine,
      rating: restaurant.rating,
      deliveryMin: restaurant.deliveryMin,
      deliveryMax: restaurant.deliveryMax,
      bannerImage: restaurant.bannerImage,
      menu: menuByCategory,
    };
  }
}