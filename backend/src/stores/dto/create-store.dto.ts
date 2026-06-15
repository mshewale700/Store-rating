import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ example: 'Supermart General Store' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'contact@supermart.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '789 Grocery Boulevard, Retail Park' })
  @IsNotEmpty()
  @IsString()
  address!: string;

  @ApiProperty({ example: 'uuid-string-of-store-owner' })
  @IsNotEmpty()
  @IsUUID()
  ownerId!: string;
}
