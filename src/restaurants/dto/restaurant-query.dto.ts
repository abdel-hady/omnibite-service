import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RestaurantQueryDto {
  @ApiProperty({
    description: 'Cuisine of the restaurant',
    example: 'Japanese',
    required: false
  })
  @IsOptional()
  @IsString()
  cuisine?: string;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Limit of the restaurant',
    example: 10,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 12;
}