import { IsBoolean } from 'class-validator';

export class ToggleAccountServiceDto {
  @IsBoolean()
  isActive: boolean;
}
