import type { Person, PersonRole } from '../../types/content';

const ROLE_ORDER: readonly { role: PersonRole; label: string }[] = [
  { role: 'official', label: 'Officials' },
  { role: 'faculty', label: 'Faculty' },
  // Added and renamed 2026-11-22 (user's request): the Registrar III and Librarian III moved out of Staff.
  { role: 'admin-support', label: 'Administrative Support Services' },
  { role: 'staff', label: 'Graduate School Staff' },
  { role: 'student-assistant', label: 'Student Assistants' },
];

/** Groups people by role in the official order. Empty groups are dropped; input order is kept within a group. */
export function groupByRole(people: readonly Person[]): { role: PersonRole; label: string; people: Person[] }[] {
  return ROLE_ORDER.map(({ role, label }) => ({ role, label, people: people.filter((p) => p.role === role) })).filter(
    (group) => group.people.length > 0,
  );
}
