import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Regular Customer Account User', minLength: 20, maxLength: 60 })
  @IsNotEmpty()
  @IsString()
  @MinLength(20, { message: 'Name must be at least 20 characters long' })
  @MaxLength(60, { message: 'Name must be at most 60 characters long' })
  name!: string;

  @ApiProperty({ example: 'user@storerating.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @ApiProperty({ example: '101 Residential Complex, Suburbia', maxLength: 400 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(400, { message: 'Address must be at most 400 characters long' })
  address!: string;

  @ApiProperty({ example: 'User@123', minLength: 8, maxLength: 16 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(16, { message: 'Password must be at most 16 characters long' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/, { message: 'Password must contain at least one special character' })
  password!: string;
}
