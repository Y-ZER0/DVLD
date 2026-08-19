import { Gender } from '../enums';

export interface PersonDto {
  id: number;
  nationalNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  photoUrl?: string;
  gender: Gender;
  address: string;
  phone: string;
  email: string;
  countryName: string;
}

export interface PaginatedResultDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}
