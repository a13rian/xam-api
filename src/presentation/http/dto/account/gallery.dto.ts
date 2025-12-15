import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsArray,
  IsNumber,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddGalleryImageDto {
  @ApiProperty({ description: 'Image URL' })
  @IsUrl()
  @MaxLength(500)
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Image caption' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @ApiPropertyOptional({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class UpdateGalleryImageDto {
  @ApiPropertyOptional({ description: 'New image URL' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Image caption' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;
}

export class GalleryItemOrderDto {
  @ApiProperty({ description: 'Gallery item ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Sort order' })
  @IsNumber()
  @Min(0)
  sortOrder: number;
}

export class ReorderGalleryDto {
  @ApiProperty({
    description: 'List of items with new sort orders',
    type: [GalleryItemOrderDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GalleryItemOrderDto)
  items: GalleryItemOrderDto[];
}

export class GalleryItemResponseDto {
  @ApiProperty({ description: 'Gallery item ID' })
  id: string;

  @ApiProperty({ description: 'Account ID' })
  accountId: string;

  @ApiProperty({ description: 'Image URL' })
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Image caption' })
  caption: string | null;

  @ApiProperty({ description: 'Sort order' })
  sortOrder: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}
