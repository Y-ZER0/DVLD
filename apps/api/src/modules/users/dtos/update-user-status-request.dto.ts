import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusRequestDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}