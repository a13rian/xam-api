import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateAccountServiceDto {
  @IsString()
  categoryId: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
