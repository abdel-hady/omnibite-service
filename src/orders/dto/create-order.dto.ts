import { Type } from "class-transformer";
import { IsString, ValidateNested, ArrayMinSize, IsObject } from "class-validator";
import { CreateOrderItemDto } from "./create-order-item.dto.js";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {
  @ApiProperty({ example: "cmudgu83q0000tjli59wdnruu" })
  @IsString()
  restaurantId: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
    example: [
      {
        menuItemId: "menu-be-001",
        quantity: 1,
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1)
  items: CreateOrderItemDto[];

  @ApiProperty({
    example: {
      street: "123 Main St",
      city: "Anytown",
      postcode: "12345",
      notes: "Leave at the front door",
      phone: "1234567890",
    },
  })
  @IsObject()
  deliveryAddress: {
    street: string;
    city: string;
    postcode?: string;
    notes?: string;
    phone: string;
  };
}