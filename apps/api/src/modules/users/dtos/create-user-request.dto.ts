import {
  IsInt,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserRequestDto {
  @IsInt()
  @IsPositive()
  personId: number;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'Username may only contain letters, numbers, dots, dashes and underscores',
  })
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
