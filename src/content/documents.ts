import type { CertificateContent, ResourceGroup } from '../types/content';

export const certificate: CertificateContent = {
  pdf: { id: 'certificate-pdf', title: 'Certificate of Authenticity (PDF)', format: 'pdf', status: 'pending' },
  image: { status: 'pending', label: 'Certificate of Authenticity (image)' },
};

export const additionalFiles: ResourceGroup[] = [
  {
    id: 'additional-files',
    title: 'Additional Files for the Accreditors',
    status: 'pending',
    items: [
      { id: 'additional-files-list', title: 'Additional Files for the Accreditors (UCN file list)', format: 'doc', status: 'pending' },
    ],
  },
];
