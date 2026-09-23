import { IsInt, IsString, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderItemDto {
  @ApiProperty({ example: "23525185-b3ae-46e8-9c24-9c1e6f9c2c2c" })
  @IsString()
  menuItemId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}