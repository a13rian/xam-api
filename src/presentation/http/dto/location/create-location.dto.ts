import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(500)
  street: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @IsString()
  @MaxLength(100)
  district: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsOptional()
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
