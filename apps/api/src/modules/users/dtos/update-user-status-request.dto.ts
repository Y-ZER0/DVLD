import { IsBoolean, IsNotEmpty } from 'class-validator';

// UpdateUserStatusRequestDto — payload for PATCH /users/:id/status
// (build-plan.md § 2.1). The active/inactive toggle backs the 2.2 Switch
// column. Deactivation takes effect at the very next authenticated
// request because JwtStrategy re-checks Users.IsActive per request
// (Session 2 decision) — no token revocation needed.
export class UpdateUserStatusRequestDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}