import {
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
  IsString,
  Matches,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OperatingHoursItemDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'openTime must be in HH:mm format',
  })
  openTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'closeTime must be in HH:mm format',
  })
  closeTime: string;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class SetOperatingHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHoursItemDto)
  hours: OperatingHoursItemDto[];
}
