import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Smash Burger' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'smash-burger' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  ownerId: string;
}

