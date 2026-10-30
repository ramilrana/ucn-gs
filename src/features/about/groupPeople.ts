import type { Person, PersonRole } from '../../types/content';

const ROLE_ORDER: readonly { role: PersonRole; label: string }[] = [
  { role: 'official', label: 'Officials' },
  { role: 'faculty', label: 'Faculty' },
  { role: 'staff', label: 'Staff' },
  { role: 'student-assistant', label: 'Student Assistants' },
];

export const UNSPECIFIED_DEPARTMENT = 'Department not specified';

/** Groups people by role in the official order. Empty groups are dropped; input order is kept within a group. */
export function groupByRole(people: readonly Person[]): { role: PersonRole; label: string; people: Person[] }[] {
  return ROLE_ORDER.map(({ role, label }) => ({ role, label, people: people.filter((p) => p.role === role) })).filter(
    (group) => group.people.length > 0,
  );
}

/** Faculty only, grouped by department A-Z (names A-Z within each). Faculty without a department go last. */
export function groupByDepartment(people: readonly Person[]): { department: string; people: Person[] }[] {
  const byDepartment = new Map<string, Person[]>();
  for (const person of people) {
    if (person.role !== 'faculty') continue;
    const department = person.department?.trim() || UNSPECIFIED_DEPARTMENT;
    const list = byDepartment.get(department);
    if (list) list.push(person);
    else byDepartment.set(department, [person]);
  }
  const groups = Array.from(byDepartment, ([department, members]) => ({
    department,
    people: [...members].sort((a, b) => a.name.localeCompare(b.name, 'en')),
  }));
  const rank = (department: string) => (department === UNSPECIFIED_DEPARTMENT ? 1 : 0);
  return groups.sort((a, b) => rank(a.department) - rank(b.department) || a.department.localeCompare(b.department, 'en'));
}
