// ApplicationType contracts — the ApplicationTypes lookup table projected to
// the client (architecture.md § schema, invariant #9). applicationTypeTitle
// is the enum label itself; applicationFees mirrors the LICENSE_CLASSES
// fee convention: string from the decimal column, display-only client-side.
import type { ApplicationType } from '../enums/application-type.enum';

// A single application type row as the API returns it.
export interface ApplicationTypeDto {
  id: number;
  applicationTypeTitle: ApplicationType;
  applicationFees: string;
}