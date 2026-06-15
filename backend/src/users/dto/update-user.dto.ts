import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { Role } from '../../role.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Updated User Long Name Here', minLength: 20, maxLength: 60 })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(60)
  name?: string;

  @ApiPropertyOptional({ example: 'updated@storerating.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'New Address Location, Residential St', maxLength: 400 })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  address?: string;

  @ApiPropertyOptional({ example: 'NewPass@123', minLength: 8, maxLength: 16 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/(?=.*[A-Z])/)
  @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/)
  password?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.USER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
