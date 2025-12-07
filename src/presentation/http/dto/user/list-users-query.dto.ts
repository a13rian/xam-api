import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../common';

export class ListUsersQueryDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
