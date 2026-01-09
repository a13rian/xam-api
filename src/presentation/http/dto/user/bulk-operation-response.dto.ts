import { ApiProperty } from '@nestjs/swagger';

export class BulkOperationFailureDto {
  @ApiProperty({ description: 'ID of the failed item' })
  id: string;

  @ApiProperty({ description: 'Reason for failure' })
  reason: string;
}

export class BulkOperationResponseDto {
  @ApiProperty({ description: 'Number of successful operations' })
  successCount: number;

  @ApiProperty({ description: 'Number of failed operations' })
  failureCount: number;

  @ApiProperty({
    description: 'Details of failed operations',
    type: [BulkOperationFailureDto],
  })
  failures: BulkOperationFailureDto[];
}
