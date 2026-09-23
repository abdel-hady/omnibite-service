import { Controller, Get, Param, Query } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service.js';
import { RestaurantQueryDto } from './dto/restaurant-query.dto.js';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiResponse({ status: 200, description: 'Return all restaurants.' })
  @ApiResponse({ status: 400, description: 'Bad Request (validation failed).' })
  findAll(@Query() query: RestaurantQueryDto) {
    return this.restaurantsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get restaurant by slug' })
  @ApiParam({ name: 'slug', description: 'Restaurant slug' })
  @ApiResponse({ status: 200, description: 'Return restaurant profile.' })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  findOne(@Param('slug') slug: string) {
    return this.restaurantsService.findBySlug(slug);
  }
}