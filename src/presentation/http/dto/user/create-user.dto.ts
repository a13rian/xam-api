import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];
}
