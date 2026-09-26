import { Controller, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { VendorService } from './vendor.service.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import type { RequestWithUser } from '../users/users.controller.js';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('vendor')
@ApiBearerAuth()
@Controller('vendor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RESTAURANT')
export class VendorController {
  constructor(private vendorService: VendorService) { }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders for the vendor' })
  @ApiResponse({ status: 200, description: 'Return all orders for the vendor.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getOrders(@Req() req: RequestWithUser) {
    return this.vendorService.getOrders(req.user.restaurantId!);
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update order status for the vendor' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Return updated order.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.vendorService.updateOrderStatus(id, req.user.id, dto.status);
  }
}