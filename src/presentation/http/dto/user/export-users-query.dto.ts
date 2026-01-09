import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum ExportFormat {
  CSV = 'csv',
}

export class ExportUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Export format',
    enum: ExportFormat,
    default: ExportFormat.CSV,
  })
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat = ExportFormat.CSV;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by role ID' })
  @IsOptional()
  @IsString()
  roleId?: string;
}
