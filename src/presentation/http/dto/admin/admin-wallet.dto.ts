import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ListAllWalletsQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsNumber()
  @Min(1)
  @ApiProperty({ required: false, default: 1 })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsNumber()
  @Min(1)
  @ApiProperty({ required: false, default: 20 })
  limit?: number = 20;
}

export class AdminAdjustBalanceDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Amount to adjust (positive for credit, negative for debit)',
  })
  amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Reason for the adjustment' })
  reason: string;
}

export class WalletListItemDto {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export class WalletListResponseDto {
  items: WalletListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AdminAdjustBalanceResponseDto {
  transactionId: string;
  walletId: string;
  amount: number;
  balanceAfter: number;
  currency: string;
}
