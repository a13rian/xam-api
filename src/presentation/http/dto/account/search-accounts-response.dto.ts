import { ApiProperty } from '@nestjs/swagger';

export class AccountSearchItemDto {
  @ApiProperty({ example: 'acc_xxx' })
  id: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  displayName: string;

  @ApiProperty({ example: 'individual' })
  type: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: '123 Nguyễn Huệ', nullable: true })
  street: string | null;

  @ApiProperty({ example: 'Bến Nghé', nullable: true })
  ward: string | null;

  @ApiProperty({ example: 'Quận 1', nullable: true })
  district: string | null;

  @ApiProperty({ example: 'Thành phố Hồ Chí Minh', nullable: true })
  city: string | null;

  @ApiProperty({ example: 10.7769, nullable: true })
  latitude: number | null;

  @ApiProperty({ example: 106.7009, nullable: true })
  longitude: number | null;

  @ApiProperty({
    description: 'Distance from search point in kilometers',
    example: 0.5,
  })
  distanceKm: number;
}

export class SearchAccountsResponseDto {
  @ApiProperty({ type: [AccountSearchItemDto] })
  items: AccountSearchItemDto[];

  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 8 })
  totalPages: number;
}
