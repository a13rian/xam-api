import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AccountTypeEnum } from '../../../../core/domain/account/value-objects/account-type.vo';
import { AccountRoleEnum } from '../../../../core/domain/account/value-objects/account-role.vo';
import { AccountStatusEnum } from '../../../../core/domain/account/value-objects/account-status.vo';

export class AdminUpdateAccountDto {
  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Specialization' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  specialization?: string;

  @ApiPropertyOptional({ description: 'Personal bio' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  personalBio?: string;

  @ApiPropertyOptional({ description: 'Portfolio URL or description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  portfolio?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Business email' })
  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Tagline' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string;

  @ApiPropertyOptional({ description: 'Verification status' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class SuspendAccountDto {
  @ApiProperty({ description: 'Reason for suspension' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason: string;
}

export class AdminAccountDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: AccountTypeEnum })
  type: AccountTypeEnum;

  @ApiPropertyOptional({ enum: AccountRoleEnum })
  role: AccountRoleEnum | null;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  specialization: string | null;

  @ApiPropertyOptional()
  portfolio: string | null;

  @ApiPropertyOptional()
  personalBio: string | null;

  @ApiProperty({ enum: AccountStatusEnum })
  status: AccountStatusEnum;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  approvedAt: Date | null;

  @ApiPropertyOptional()
  approvedBy: string | null;

  @ApiPropertyOptional()
  rejectionReason: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Media fields
  @ApiPropertyOptional()
  avatarUrl: string | null;

  @ApiPropertyOptional()
  coverImageUrl: string | null;

  @ApiPropertyOptional()
  videoIntroUrl: string | null;

  // Contact fields
  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  businessEmail: string | null;

  @ApiPropertyOptional()
  website: string | null;

  // Professional fields
  @ApiPropertyOptional()
  tagline: string | null;

  @ApiPropertyOptional()
  languages: string[];

  // Trust & Verification
  @ApiProperty()
  isVerified: boolean;

  @ApiPropertyOptional()
  verifiedAt: Date | null;

  @ApiPropertyOptional()
  badges: string[];

  @ApiPropertyOptional()
  rating: number | null;

  @ApiProperty()
  totalReviews: number;

  @ApiProperty()
  completedBookings: number;

  // Organization info (for business accounts)
  @ApiPropertyOptional()
  organizationId: string | null;
}
