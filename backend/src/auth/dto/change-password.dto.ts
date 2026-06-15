import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'New password (8-16 chars, 1 uppercase, 1 special character)',
    example: 'NewPass@123',
  })
  @IsString()
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/, {
    message: 'Password must contain at least one special character',
  })
  newPassword: string;
}
