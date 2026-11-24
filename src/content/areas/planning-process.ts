import p1 from '../../assets/areas/planning-process/photo-01.jpg?w=640;975&format=webp&as=picture';
import p2 from '../../assets/areas/planning-process/photo-02.jpg?w=640;975&format=webp&as=picture';
import p3 from '../../assets/areas/planning-process/photo-03.jpg?w=640;975&format=webp&as=picture';
import p4 from '../../assets/areas/planning-process/photo-04.jpg?w=640;975&format=webp&as=picture';
import p5 from '../../assets/areas/planning-process/photo-05.jpg?w=640;975&format=webp&as=picture';
import p6 from '../../assets/areas/planning-process/photo-06.jpg?w=640;975&format=webp&as=picture';
import p7 from '../../assets/areas/planning-process/photo-07.jpg?w=640;975&format=webp&as=picture';
import p8 from '../../assets/areas/planning-process/photo-08.jpg?w=640;975&format=webp&as=picture';
import p9 from '../../assets/areas/planning-process/photo-09.jpg?w=640;975&format=webp&as=picture';
import p10 from '../../assets/areas/planning-process/photo-10.jpg?w=640;975&format=webp&as=picture';
import p11 from '../../assets/areas/planning-process/photo-11.jpg?w=640;975&format=webp&as=picture';
import { toImageAsset } from '../../lib/images';
import type { Area, Resource } from '../../types/content';

// Materials from UCN (2026-11-24): the narrative profile ("Planning Process-Narrative Profile.pdf") and one document,
// PDFs on Google Drive shown in Drive's preview frame, and 11 photos (the "5. Planning Process" folder, downloaded by
// the user as a zip: files 46–56, in order). The document title is the file name without ".pdf". Each link was opened
// and matches its name. Alt text worded by us, repeating printed wording (photo 3 prints both "2023-2033" and
// "2023-2032" for the land use plan; both kept).

const drivePdf = (id: string, title: string, fileId: string): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

// File name must be the slug: this file is src/content/areas/planning-process.ts
const area: Area = {
  slug: 'planning-process',
  order: 5,
  title: 'Planning Process',
  status: 'published',
  gallery: {
    status: 'published',
    label: 'Planning Process photo gallery',
    value: [
      toImageAsset(
        p1,
        'UCN Planning Process, Master in Public Administration: Atty. Ryan L. Estevez, DPA, SUC President III, speaking, with the quote "The aim of the University of Camarines Norte is to bring the Classroom to the Community"',
      ),
      toImageAsset(
        p2,
        'UCN Vision ("A Transformative Borderless University Empowering Sustainable Communities"), Mission, Ethos ("From Classroom to CommUnity") and tagline ("Lead. Innovate. Transform. #BeLIT. U CaN.")',
      ),
      toImageAsset(
        p3,
        'Covers of the Camarines Norte State College Land Use Development and Infrastructure Plan (LUDIP) 2023-2033 and 2023-2032, and the message of the President',
      ),
      toImageAsset(p4, 'Cover of the CNSC Strategic Development Plan 2014-2020 beside its page "CNSC in 2020" listing six milestones'),
      toImageAsset(
        p5,
        'Cover of the CNSC Strategic Plan "Excellence 2032", with pages on its goals, key result areas and the 2020–2032 major milestones',
      ),
      toImageAsset(
        p6,
        'Speakers at a strategic planning workshop, Day 3, September 27, 2024, Primus Hotel and Resort, Naga City',
      ),
      toImageAsset(
        p7,
        'Workshop groups at "University Bound: CNSC\'s Innovative Strategic Planning Workshop", Labo Campus, May 24, 2024, and the Pre-Strategic Planning Workshop on the devolution of the Sustainable Development Goals, September 19, 2024, CNSC Student Activity Center, Main Campus',
      ),
      toImageAsset(p8, 'Cover and table of contents of "The Quality Assurance Primer" of Camarines Norte State College'),
      toImageAsset(p9, 'Group photo of participants at the Camarines Norte State College Public Policy Analysis Colloquium'),
      toImageAsset(
        p10,
        'CNSC Awards: Gawad Kalasag Award, Consumer Protection Champion, and CSC PRIME HRM Level II',
      ),
      toImageAsset(
        p11,
        'CNSC Awards: Government Best Practices Award from the Development Academy of the Philippines, Rank 2 Highest Licensure Performing School in the Bicol Region, and PWD Friendly HEI awarded by the Province of Camarines Norte',
      ),
    ],
  },
  narrativeReport: drivePdf(
    'area-planning-process-narrative',
    'Planning Process Narrative Profile',
    '1J0MV6cJRKWF1Sh9GjGlX5FCWkgPk-UR3',
  ),
  groups: [
    {
      id: 'area-planning-process-documents',
      title: 'Documents',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'area-planning-process-organizational-structure',
            'BOR Approved UCN Organizational Structure v 2026',
            '1iKfJNhROZe8CZiTQRXnNOwdTTc3D5G5G',
          ),
        },
      ],
    },
  ],
  additionalFiles: [],
  avp: { id: 'area-planning-process-avp', title: 'Planning Process AVP', format: 'video', status: 'pending' },
};

export default area;
