export interface AuthUserDto {
  id: number;
  username: string;
  personId: number;
  fullName: string;
}

export interface AuthDto {
  token: string;
  user: AuthUserDto;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}