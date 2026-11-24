import p1 from '../../assets/areas/international-linkages-and-consortia/photo-01.jpg?w=640;975&format=webp&as=picture';
import p2 from '../../assets/areas/international-linkages-and-consortia/photo-02.jpg?w=640;975&format=webp&as=picture';
import p3 from '../../assets/areas/international-linkages-and-consortia/photo-03.jpg?w=640;975&format=webp&as=picture';
import p4 from '../../assets/areas/international-linkages-and-consortia/photo-04.jpg?w=640;975&format=webp&as=picture';
import p5 from '../../assets/areas/international-linkages-and-consortia/photo-05.jpg?w=640;975&format=webp&as=picture';
import p6 from '../../assets/areas/international-linkages-and-consortia/photo-06.jpg?w=640;975&format=webp&as=picture';
import p7 from '../../assets/areas/international-linkages-and-consortia/photo-07.jpg?w=640;975&format=webp&as=picture';
import p8 from '../../assets/areas/international-linkages-and-consortia/photo-08.jpg?w=640;975&format=webp&as=picture';
import p9 from '../../assets/areas/international-linkages-and-consortia/photo-09.jpg?w=640;975&format=webp&as=picture';
import p10 from '../../assets/areas/international-linkages-and-consortia/photo-10.jpg?w=640;975&format=webp&as=picture';
import { toImageAsset } from '../../lib/images';
import type { Area, Resource } from '../../types/content';

// Materials from UCN (2026-11-24): the narrative profile ("Narrative Profile - International Linkages (MPA - Level
// 4).pdf") and three accomplishment reports from the "Area IV. International Linkages and Consortia" Drive folder, all
// PDFs on Google Drive shown in Drive's preview frame, and 10 photos (the "4. International Linkages" folder,
// downloaded by the user as a zip: files 31–40, in order). Report titles are the ones the user supplied; the Drive file
// names are shorter ("ACCOMPLISHMENT REPORT - ICOP.pdf", "Accomplishment Report - AIT.pdf", "Accomplishment Report -
// ICBEST Mam EMS.pdf"). Each link was opened and matches. Alt text worded by us, repeating printed wording
// ("TECHONOLOGY" on photo 1 spelled correctly here).

const drivePdf = (id: string, title: string, fileId: string): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

const driveDocument = (id: string, title: string, fileId: string) => ({
  type: 'document' as const,
  embed: true,
  resource: drivePdf(id, title, fileId),
});

// File name must be the slug: this file is src/content/areas/international-linkages-and-consortia.ts
const area: Area = {
  slug: 'international-linkages-and-consortia',
  order: 4,
  title: 'International Linkages & Consortia',
  status: 'published',
  gallery: {
    status: 'published',
    label: 'International Linkages & Consortia photo gallery',
    value: [
      toImageAsset(
        p1,
        'Cover of the International Conference on Business, Education, Science and Technology (ICBEST) 2026 Conference Proceedings, I-Shou University, Kaohsiung City, Taiwan, October 22–24, 2026',
      ),
      toImageAsset(
        p2,
        'Two invitations to the UCN Graduate School international symposium "Advancing Scholarship: Upholding Integrity, Ensuring Rigor, and Creating Impact in Postgraduate Research", October 17 and 24, 2026, online, with resource speakers Dr. Nurul Liyana Mohd Kamil and Dr. Nur Hairani Abd Rahman, Associate Professors, Universiti Malaya, Malaysia',
      ),
      toImageAsset(
        p3,
        'Screenshots of the online international symposium: Assoc. Prof. Dr. Nurul Liyana Mohd Kamil of Universiti Malaya presenting "Designing Valid Studies, Ensuring Reliability, and Reproducibility in Theses and Dissertations" to participants on Google Meet',
      ),
      toImageAsset(
        p4,
        'Screenshots of the online international symposium: Associate Professor Dr. Nur Hairani Abd Rahman of Universiti Malaya presenting "Research Integrity in Postgraduate Research" to participants on Google Meet',
      ),
      toImageAsset(
        p5,
        'Poster for the 2nd International Congress on Pineapple for Better Value Chain Adaptation (ICoP 2026), September 8–10, 2026, Camarines Norte State College, Daet, Camarines Norte, Philippines',
      ),
      toImageAsset(p6, 'Three visiting faculty members listening to a host in a laboratory coat during a benchmarking visit'),
      toImageAsset(
        p7,
        'Meeting at a conference table with Philippine and Thai flags and a flower arrangement, during an international partnership visit',
      ),
      toImageAsset(p8, 'Screen showing the Kasetsart University "Knowledge of the Land" banner in a meeting room'),
      toImageAsset(
        p9,
        'UCN College of Business and Public Administration congratulates Emmalyn C. Guaves, DBA, on her participation in the 3rd International Conference on Business, Education, Science, and Technology (ICBEST) 2026, Kaohsiung City, Taiwan, October 22–24, 2026',
      ),
      toImageAsset(p10, 'Two participants beside the "Welcome Participants & Guests" ICBEST 2026 display'),
    ],
  },
  narrativeReport: drivePdf(
    'area-international-linkages-and-consortia-narrative',
    'International Linkages & Consortia Narrative Profile',
    '1p7g4oqHZ4_dx2ocYEHPiCHZBazE3cMw1',
  ),
  groups: [
    {
      id: 'area-international-linkages-and-consortia-documents',
      title: 'Documents',
      status: 'published',
      blocks: [
        driveDocument(
          'area-international-linkages-and-consortia-icop-2026',
          'INTERNATIONAL LINKAGE ENGAGEMENT THROUGH THE 2ND INTERNATIONAL CONGRESS ON PINEAPPLE FOR BETTER VALUE CHAIN ADAPTATION (ICOP 2026)',
          '1RSJV49Gqca9Dk-3kgs63408yU_RQFxqs',
        ),
        driveDocument(
          'area-international-linkages-and-consortia-ait',
          'ACCOMPLISHMENT REPORT INTERNATIONAL BENCHMARKING AND PARTNERSHIP DEVELOPMENT ENGAGEMENT WITH THE ASIAN INSTITUTE OF TECHNOLOGY (AIT), THAILAND',
          '1cN8sGzeb18eo2Odd6Vzrm1dSvu0h4PNC',
        ),
        driveDocument(
          'area-international-linkages-and-consortia-icbest-2026',
          'ACCOMPLISHMENT REPORT INTERNATIONAL RESEARCH PRESENTATION AND ACADEMIC ENGAGEMENT THROUGH THE 3RD INTERNATIONAL CONFERENCE ON BUSINESS, EDUCATION, SCIENCE, AND TECHNOLOGY (ICBEST) 2026',
          '1hXitjD9qCYHkVhTEsD2HfK9va3VTJNS0',
        ),
      ],
    },
  ],
  additionalFiles: [],
  avp: {
    id: 'area-international-linkages-and-consortia-avp',
    title: 'International Linkages & Consortia AVP',
    format: 'video',
    status: 'pending',
  },
};

export default area;
