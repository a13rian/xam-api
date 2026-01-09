import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsBoolean,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class BulkUpdateStatusDto {
  @ApiProperty({
    description: 'Array of user IDs to update',
    example: ['usr_abc123xyz'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one user ID is required' })
  @ArrayMaxSize(100, { message: 'Cannot update more than 100 users at once' })
  @IsString({ each: true, message: 'Each ID must be a string' })
  ids: string[];

  @ApiProperty({
    description: 'The active status to set for all users',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
