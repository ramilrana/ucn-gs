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
  // Supplied 2026-11-22 (user's paste, verbatim).
  contact: {
    status: 'published',
    label: 'Campus address and contact details',
    value: {
      address: 'Graduate School Office, F. Pimentel Ave., Daet, 4600 Camarines Norte, Philippines',
      email: 'graduateschool@ucn.edu.ph',
    },
  },
  // Supplied 2026-11-21: the map is pinned at the given coordinates; the coordinates text is shown as supplied.
  mapQuery: {
    status: 'published',
    label: 'Campus address or map search for the location map',
    value: '14.109444,122.957500',
  },
  coordinates: {
    status: 'published',
    label: 'Campus coordinates',
    value: `14.109444° N, 122.957500° E (14° 6' 34" N, 122° 57' 27" E)`,
  },
};
