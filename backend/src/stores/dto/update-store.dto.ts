import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreDto {
  @ApiPropertyOptional({ example: 'Updated Supermart General Store' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'updated-contact@supermart.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Updated Address Location, Retail Park' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'uuid-string-of-store-owner' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
