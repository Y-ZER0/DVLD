// Frontend request DTO for PATCH /people/:id (code-standards.md § 1
// naming). The backend is a true partial update — only fields present in
// the body are validated and applied — so every field here is optional.
// The Edit modal happens to always send the full form; the type still
// allows the sparse patch the endpoint supports. photoUrl is deliberately
// absent: the UI has no photo upload yet (null would clear a photo).

import type { CreatePersonRequestDto } from "../dtos/create-person-request.dto"

export type UpdatePersonRequestDto = Partial<CreatePersonRequestDto>