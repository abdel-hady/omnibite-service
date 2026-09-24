import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../../generated/prisma/index.js';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}