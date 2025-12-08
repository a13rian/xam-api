import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class WithdrawDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
