import p1 from '../../assets/areas/teaching-and-learning/photo-01.jpg?w=640;975&format=webp&as=picture';
import p2 from '../../assets/areas/teaching-and-learning/photo-02.jpg?w=640;975&format=webp&as=picture';
import p3 from '../../assets/areas/teaching-and-learning/photo-03.jpg?w=640;975&format=webp&as=picture';
import p4 from '../../assets/areas/teaching-and-learning/photo-04.jpg?w=640;975&format=webp&as=picture';
import p5 from '../../assets/areas/teaching-and-learning/photo-05.jpg?w=640;975&format=webp&as=picture';
import p6 from '../../assets/areas/teaching-and-learning/photo-06.jpg?w=640;975&format=webp&as=picture';
import { toImageAsset } from '../../lib/images';
import type { Area, Resource } from '../../types/content';

// Renamed 2026-11-23 from "Performance of Graduates" (slug performance-of-graduates) at the user's request.
// Materials from UCN (2026-11-24): the narrative profile ("Narrative Profile_Area 2_MPA Level 4.pdf") and two
// documents, all PDFs on Google Drive shown in Drive's preview frame. Document titles are the supplied file names
// without ".pdf". Each link was opened and matches its name. Photos: the "2. Teaching and Learning" Drive folder
// (files 18–23, in order). Alt text worded by us, repeating the printed wording ("Assessmet" on photo 2 spelled
// correctly here).

const drivePdf = (id: string, title: string, fileId: string): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

// File name must be the slug: this file is src/content/areas/teaching-and-learning.ts
const area: Area = {
  slug: 'teaching-and-learning',
  order: 2,
  title: 'Teaching and Learning',
  status: 'published',
  gallery: {
    status: 'published',
    label: 'Teaching and Learning photo gallery',
    value: [
      toImageAsset(
        p1,
        'Lakbay-Diwa Publishing congratulates published author Marifel Lamadrid Fernandez, MPA, Administrative Aide II, Provincial Information Office, Provincial Government of Camarines Norte, for "Communication Strategies for Disaster Preparedness and Response in the Municipality of Daet, Camarines Norte" in Visionary Voices, Volume 2 Issue 6, June 2026',
      ),
      toImageAsset(
        p2,
        'UCN Graduate School, Master in Public Administration: Jasmin Manlangit-Dacillo, Best Paper Bronze Award at the 2026 National Research Symposium, November 17–18, 2026, Angeles City, Pampanga, for "Market Assessment and Refinement of Queen Pineapple-Based Flour and its Processed Food Product in Camarines Norte" (DA Regional Field Office 5)',
      ),
      toImageAsset(
        p3,
        'Cover of the 2026 National Research Symposium program, November 17–18, 2026, beside Jasmin Manlangit-Dacillo holding her award',
      ),
      toImageAsset(
        p4,
        'UCN Graduate School, Master in Public Administration, career progression: Ricky A. Hernandez, promoted from Labor and Employment Officer II to Labor and Employment Officer III effective February 19, 2024, with his awards and recognitions from 2020 to 2025',
      ),
      toImageAsset(
        p5,
        'Provincial Cooperatives Development Office congratulates Engr. Celeste M. Salvanera, Senior Agriculturist, Employee of the Month of November',
      ),
      toImageAsset(
        p6,
        'Philippine HR Institute congratulates Mr. Marlo Arejola Dela Peña, FCHRM Cohort 9, CHRA Batch 70 passer',
      ),
    ],
  },
  narrativeReport: drivePdf(
    'area-teaching-and-learning-narrative',
    'Teaching and Learning Narrative Profile',
    '1aAOdcBI2KTozWivI39EHz6scQduWlsd6',
  ),
  groups: [
    {
      id: 'area-teaching-and-learning-documents',
      title: 'Documents',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'area-teaching-and-learning-tracer-study',
            'MPA Tracer Study 2021-2026',
            '1CVNdUdSe8gtrDKAVzCL_9CzTdIbpaTm7',
          ),
        },
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'area-teaching-and-learning-employer-satisfaction',
            'MPA_Employer_Satisfaction',
            '1WqHdZEufAXT-KKgKoKc72FdK5UYUH-Of',
          ),
        },
      ],
    },
  ],
  additionalFiles: [],
  // AVP: the "2. Teaching and Learning" subfolder of UCN's AVP Drive folder (2026-11-24; a link, folders cannot be framed).
  avp: {
    id: 'area-teaching-and-learning-avp',
    title: '2. Teaching and Learning',
    format: 'folder',
    status: 'published',
    source: { kind: 'drive-folder', folderId: '1LPBYfBmnEarAWFvuS4g6ZrcQQxTqzxAq' },
  },
};

export default area;
