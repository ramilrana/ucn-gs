import type { SiteContent } from '../types/content';

export const site: SiteContent = {
  universityName: 'University of Camarines Norte',
  schoolName: 'Graduate School',
  programName: {
    status: 'published',
    label: 'Name of the program under accreditation',
    value: 'Master in Public Administration',
  },
  areasLabel: 'Accreditation Areas',
  contentUpdated: '2026-11-18',
  contact: { status: 'pending', label: 'Campus address and contact details' },
  mapQuery: { status: 'pending', label: 'Campus address or map search for the location map' },
};
