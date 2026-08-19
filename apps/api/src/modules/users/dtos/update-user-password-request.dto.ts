import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserPasswordRequestDto {
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}