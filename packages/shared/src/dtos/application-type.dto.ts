import type { ApplicationType } from '../enums/application-type.enum';

export interface ApplicationTypeDto {
  id: number;
  applicationTypeTitle: ApplicationType;
  applicationFees: string;
}