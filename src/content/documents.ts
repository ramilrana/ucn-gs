import certificateScan from '../assets/certificate/certificate.jpg?w=782;1563&format=webp&as=picture';
import { toImageAsset } from '../lib/images';
import type { CertificateContent } from '../types/content';

// The signed certification from UCN (2026-11-20): the PDF as supplied, and its one page (a 1563x2240 scan taken
// out of the PDF unchanged) shown as an image. The alt text repeats the certificate's wording.
export const certificate: CertificateContent = {
  pdf: {
    id: 'certificate-pdf',
    title: 'Certificate of Authenticity (PDF)',
    format: 'pdf',
    status: 'published',
    downloadable: true,
    source: { kind: 'local', path: '/files/certificate-of-authenticity.pdf' },
  },
  image: {
    status: 'published',
    label: 'Certificate of Authenticity (image)',
    value: toImageAsset(
      certificateScan,
      'Certification from the University of Camarines Norte Quality Assurance Office. This is to certify that all ' +
        'documents uploaded in the official accreditation site of the University of Camarines Norte are authentic ' +
        'and have been verified. None of these documents or related materials are fraudulent and/or illegal. This ' +
        'certificate is issued pursuant to the accreditation of the Master in Public Administration (MPA) for the ' +
        'level specified in the Survey Instrument. Signed by Girly H. Naval, DBA, Dean, Graduate School; attested by ' +
        'Atty. Ryan L. Estevez, DPA, SUC President III; and signed by Raynel D. Zabala, Director, Quality Assurance Office.',
    ),
  },
};
