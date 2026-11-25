import p1 from '../../assets/areas/community-service/photo-01.jpg?w=640;975&format=webp&as=picture';
import p2 from '../../assets/areas/community-service/photo-02.jpg?w=640;975&format=webp&as=picture';
import p3 from '../../assets/areas/community-service/photo-03.jpg?w=640;975&format=webp&as=picture';
import p4 from '../../assets/areas/community-service/photo-04.jpg?w=640;975&format=webp&as=picture';
import p5 from '../../assets/areas/community-service/photo-05.jpg?w=640;975&format=webp&as=picture';
import p6 from '../../assets/areas/community-service/photo-06.jpg?w=640;975&format=webp&as=picture';
import p7 from '../../assets/areas/community-service/photo-07.jpg?w=640;975&format=webp&as=picture';
import p8 from '../../assets/areas/community-service/photo-08.jpg?w=640;975&format=webp&as=picture';
import p9 from '../../assets/areas/community-service/photo-09.jpg?w=640;975&format=webp&as=picture';
import { toImageAsset } from '../../lib/images';
import type { Area, Resource } from '../../types/content';

// Published 2026-11-23 (user's choice) so Recommendation 1 could go live. Materials from UCN (2026-11-24): the
// narrative profile ("NARRATIVE PROFILE_AREA 3_MPA Level 4.docx", a Word file on Google Drive, shown in Drive's
// preview frame), three PDFs on Google Drive and 9 photos (the "3. Community Service" Drive folder, downloaded by the
// user as a zip: files 21–29, in order). Document titles are the supplied file names without the extension. Each link
// was opened and matches its name. Alt text worded by us, repeating printed wording.

const driveFile = (id: string, title: string, fileId: string, format: Resource['format'] = 'pdf'): Resource => ({
  id,
  title,
  format,
  status: 'published',
  source: { kind: 'drive', fileId },
});

const driveDocument = (id: string, title: string, fileId: string) => ({
  type: 'document' as const,
  embed: true,
  resource: driveFile(id, title, fileId),
});

// File name must be the slug: this file is src/content/areas/community-service.ts
const area: Area = {
  slug: 'community-service',
  order: 3,
  title: 'Community Service',
  status: 'published',
  gallery: {
    status: 'published',
    label: 'Community Service photo gallery',
    value: [
      toImageAsset(
        p1,
        'CNSC Graduate School extension activity invitation: "Strengthening Integrity and Accountability in Barangay Governance Through Ethical Leadership and Public Service Values", May 30, 2026, 8:00 A.M. to 1:30 P.M., Barangay Hall, Gubat, Daet, Camarines Norte',
      ),
      toImageAsset(p2, 'Participants in aprons and face masks preparing food in a kitchen during a hands-on training'),
      toImageAsset(p3, 'Collage of Graduate School faculty and staff in matching shirts planting seedlings on a hillside'),
      toImageAsset(
        p4,
        'CNSC Project TELL V.2.0, "Communicating Waste Management", a UCN Extension Services Division radio program on DWCN 96.9 Radyo Pilipinas and Facebook Live, May 11, 2026, 10:00 to 11:00 A.M., hosted by Dr. Maria Cristina C. Azuelo and Dr. Rosalie A. Almadrones',
      ),
      toImageAsset(p5, 'The United Nations Sustainable Development Goals wheel, goals 1 to 17'),
      toImageAsset(
        p6,
        'Group photo of barangay participants holding certificates at the "Strengthening Barangay Leadership" activity, with an inset of a meeting around tables',
      ),
      toImageAsset(
        p7,
        'Brochure from the UCN Graduate School Master in Public Administration: "Ethical Leadership, Professionalism, and Good Governance: A Guide for Barangay Officials"',
      ),
      toImageAsset(p8, 'A participant speaking into a microphone during an open forum with barangay residents seated at tables'),
      toImageAsset(
        p9,
        'Two scenes from a barangay governance seminar: participants raising their hands, and a speaker presenting "Strengthening Public Service Delivery in Barangays"',
      ),
    ],
  },
  // Replaced 2026-11-25 (user's request): "GS NARRATIVE PROFILE - AREA 3.pdf" (was the Word file
  // "NARRATIVE PROFILE_AREA 3_MPA Level 4.docx").
  narrativeReport: driveFile(
    'area-community-service-narrative',
    'Community Service Narrative Profile',
    '16tjIhczmM4FOJSqIo5MmXn_I-7lkvx4N',
  ),
  groups: [
    {
      id: 'area-community-service-documents',
      title: 'Documents',
      status: 'published',
      blocks: [
        driveDocument('area-community-service-project-thrive', '1.1 PROJECT THRIVE', '1Lwonbk8fBU-HKroNZgXQJri-7nA6BcKb'),
        driveDocument(
          'area-community-service-extension-agenda',
          '3. Institutional Extension Agenda',
          '1ekYMmco4jhkjAs58bWM2kxM3OaxsdiH9',
        ),
        driveDocument('area-community-service-basic-governance-iec', '5.5 Basic Governance IEC', '1vGJIWhSu-LToRZbgQP1ANaAa3ni9cC_7'),
      ],
    },
  ],
  additionalFiles: [],
  // AVP: the "3. Community Services" subfolder of UCN's AVP Drive folder (2026-11-24; a link, folders cannot be framed).
  avp: {
    id: 'area-community-service-avp',
    title: '3. Community Services',
    format: 'folder',
    status: 'published',
    source: { kind: 'drive-folder', folderId: '1kgGXkdOqrwsYGowHieYf-bfLwtHNGG_x' },
  },
};

export default area;
