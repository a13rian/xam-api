import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../common';

export class ListOrganizationsQueryDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
