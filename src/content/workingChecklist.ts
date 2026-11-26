import type { Resource } from '../types/content';

// The "Working Checklist" every area page shows right below its photo carousel (user's request 2026-11-26): one
// shared Google Doc, "UCN_MPA_Working-Checklist-and-Accreditors-Report-Fillable (1).docx". Kept here, outside
// src/content/areas/ (every file there is loaded as an area), so a new document only needs changing in one place.

const WORKING_CHECKLIST_URL = 'https://docs.google.com/document/d/1VdYsxfept_GsuDJc05dujzEVGYCGHAkm/edit';

/** The shared Working Checklist link for one area, with an id unique to that area. */
export const workingChecklist = (slug: string): Resource => ({
  id: `area-${slug}-working-checklist`,
  title: 'UCN_MPA_Working-Checklist-and-Accreditors-Report-Fillable (1).docx',
  format: 'link',
  status: 'published',
  source: { kind: 'external', url: WORKING_CHECKLIST_URL },
});
