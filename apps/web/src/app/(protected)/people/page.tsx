import { PeoplePage } from "@/features/people/people-page"

// /people — People Management (Feature 1.2 [UI]). Thin by design
// (invariant #12): composition only, all state lives in PeoplePage and
// PeopleList. The sidebar's "People Management" entry (nav-config.ts)
// already points here; this route was a 404 until now.
export default function PeopleRoute() {
  return <PeoplePage />
}