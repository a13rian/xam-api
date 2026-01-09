import { PaginationDto } from '../common';
import {
  IsOptional,
  IsString,
  IsBoolean,
  MaxLength,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export type UserSortField =
  | 'createdAt'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'lastLoginAt';
export type SortOrder = 'ASC' | 'DESC';

export class ListUsersQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by email, name, or phone' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by role ID' })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Filter by email verification status' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isEmailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Filter users created on or after this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter users created on or before this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({
    description:
      'Filter users who last logged in on or after this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  lastLoginFrom?: string;

  @ApiPropertyOptional({
    description:
      'Filter users who last logged in on or before this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  lastLoginTo?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['createdAt', 'email', 'firstName', 'lastName', 'lastLoginAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'email', 'firstName', 'lastName', 'lastLoginAt'])
  sortBy?: UserSortField;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: SortOrder;
}
