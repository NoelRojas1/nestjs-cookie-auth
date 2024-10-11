import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  last_name?: string;
}
