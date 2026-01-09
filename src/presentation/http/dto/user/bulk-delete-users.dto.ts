import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class BulkDeleteUsersDto {
  @ApiProperty({
    description: 'Array of user IDs to delete',
    example: ['usr_abc123xyz'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one user ID is required' })
  @ArrayMaxSize(100, { message: 'Cannot delete more than 100 users at once' })
  @IsString({ each: true, message: 'Each ID must be a string' })
  ids: string[];
}
