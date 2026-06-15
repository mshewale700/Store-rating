import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { Role } from '../../role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Admin Created New User Name', minLength: 20, maxLength: 60 })
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ example: 'created@storerating.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '202 Admin Plaza, Commercial Area', maxLength: 400 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(400)
  address!: string;

  @ApiProperty({ example: 'Pass@123', minLength: 8, maxLength: 16 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/(?=.*[A-Z])/)
  @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/)
  password!: string;

  @ApiProperty({ enum: Role, example: Role.STORE_OWNER })
  @IsNotEmpty()
  @IsEnum(Role)
  role!: Role;
}
