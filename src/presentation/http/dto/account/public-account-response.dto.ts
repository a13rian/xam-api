import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicAccountGalleryImageDto {
  @ApiProperty({ example: 'gal_xxx' })
  id: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageUrl: string;

  @ApiPropertyOptional({ example: 'Ảnh profile' })
  caption: string | null;

  @ApiProperty({ example: 0 })
  sortOrder: number;
}

export class PublicAccountPriceRangeDto {
  @ApiProperty({ example: 100000 })
  min: number;

  @ApiProperty({ example: 500000 })
  max: number;

  @ApiProperty({ example: 'VND' })
  currency: string;
}

export class PublicAccountResponseDto {
  @ApiProperty({ example: 'acc_xxx' })
  id: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  displayName: string;

  @ApiProperty({ example: 'individual' })
  type: string;

  @ApiProperty({ example: 'active' })
  status: string;

  // Profile fields
  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  coverImageUrl: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/intro.mp4' })
  videoIntroUrl: string | null;

  @ApiPropertyOptional({ example: 'Chuyên gia tư vấn tâm lý' })
  tagline: string | null;

  @ApiPropertyOptional({ example: 'Tôi là người có 5 năm kinh nghiệm...' })
  personalBio: string | null;

  @ApiPropertyOptional({ example: 'Tư vấn tâm lý' })
  specialization: string | null;

  @ApiPropertyOptional({ example: 5 })
  yearsExperience: number | null;

  @ApiProperty({ example: ['Chứng chỉ A', 'Chứng chỉ B'], type: [String] })
  certifications: string[];

  // Trust & rating fields
  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiPropertyOptional({ example: 4.5 })
  rating: number | null;

  @ApiProperty({ example: 120 })
  totalReviews: number;

  @ApiProperty({ example: 50 })
  completedBookings: number;

  @ApiProperty({ example: ['verified', 'top-rated'], type: [String] })
  badges: string[];

  // Additional info
  @ApiProperty({ example: ['Vietnamese', 'English'], type: [String] })
  languages: string[];

  @ApiPropertyOptional({ type: PublicAccountPriceRangeDto })
  priceRange: PublicAccountPriceRangeDto | null;

  // Gallery
  @ApiProperty({ type: [PublicAccountGalleryImageDto] })
  gallery: PublicAccountGalleryImageDto[];
}
