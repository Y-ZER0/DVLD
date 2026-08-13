import { UsersPage } from "@/features/users/users-page"

// /users — User Management (Feature 2.2 [UI]). Thin by design
// (invariant #12): composition only, all state lives in UsersPage and
// UsersList. The sidebar's "User Management" entry (nav-config.ts)
// already points here; this route was a 404 until now.
export default function UsersRoute() {
  return <UsersPage />
}