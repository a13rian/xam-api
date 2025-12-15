import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum UploadPurpose {
  AVATAR = 'avatar',
  GALLERY = 'gallery',
  COVER = 'cover',
  DOCUMENT = 'document',
}

export class UploadFileDto {
  @ApiProperty({ enum: UploadPurpose, description: 'Purpose of the upload' })
  @IsEnum(UploadPurpose)
  purpose: UploadPurpose;

  @ApiPropertyOptional({ description: 'Optional caption for gallery images' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;
}

export class FileUploadResponseDto {
  @ApiProperty({ description: 'Public URL of the uploaded file' })
  url: string;

  @ApiProperty({ description: 'Storage key of the file' })
  key: string;

  @ApiProperty({ description: 'Bucket name' })
  bucket: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;
}

export class PresignedUrlResponseDto {
  @ApiProperty({ description: 'Presigned URL for file access' })
  url: string;

  @ApiProperty({ description: 'URL expiration time in seconds' })
  expiresIn: number;
}
