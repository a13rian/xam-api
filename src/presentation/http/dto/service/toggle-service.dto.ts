import { IsBoolean } from 'class-validator';

export class ToggleServiceDto {
  @IsBoolean()
  isActive: boolean;
}
