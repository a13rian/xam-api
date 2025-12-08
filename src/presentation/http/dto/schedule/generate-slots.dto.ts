import {
  IsDateString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateSlotsDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  slotDurationMinutes: number;

  @IsOptional()
  @IsUUID()
  staffId?: string;
}
