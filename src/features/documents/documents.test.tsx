import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CertificateContent, ImageAsset, Resource } from '../../types/content';
import { CertificateView } from './CertificateView';

const FILE_ID = '1AbCdEfGhIjKlMnOpQrStUvWx';

const pdf = (id: string, title: string, status: Resource['status'] = 'published'): Resource => ({
  id,
  title,
  format: 'pdf',
  status,
  source: { kind: 'drive', fileId: FILE_ID },
});

const image: ImageAsset = { src: '/assets/certificate-abc.png', width: 800, height: 1000, alt: 'Certificate of Authenticity' };

const renderUi = (ui: React.ReactElement, path = '/certificate-of-authenticity') => {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
};

const production = () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_CONTENT_PREVIEW', '');
};

describe('CertificateView', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('certificate renders image and embedded PDF when published', () => {
    production();
    const certificate: CertificateContent = {
      pdf: pdf('cert-pdf', 'Certificate of Authenticity (PDF)'),
      image: { label: 'Certificate image', status: 'published', value: image },
    };
    const { container } = renderUi(<CertificateView certificate={certificate} />);

    const img = screen.getByRole('img', { name: 'Certificate of Authenticity' });
    expect(img.getAttribute('src')).toBe('/assets/certificate-abc.png');
    expect(img.className).toContain('object-contain');
    expect(img.className).toContain('max-h-[80vh]');
    const full = screen.getByRole('link', { name: /Open full-size image/ });
    expect(full.getAttribute('href')).toBe('/assets/certificate-abc.png');

    const frames = container.querySelectorAll('iframe');
    expect(frames).toHaveLength(1);
    expect(frames[0]?.getAttribute('src')).toBe(`https://drive.google.com/file/d/${FILE_ID}/preview`);
    // The image comes before the PDF frame.
    expect(img.compareDocumentPosition(frames[0] as Element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('certificate with both pending shows the preparing note in prod', () => {
    production();
    const certificate: CertificateContent = {
      pdf: pdf('cert-pdf', 'Certificate of Authenticity (PDF)', 'pending'),
      image: { label: 'Certificate image', status: 'pending' },
    };
    const { container } = renderUi(<CertificateView certificate={certificate} />);
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('certificate with only the PDF published shows the PDF and no image or pending text', () => {
    production();
    const certificate: CertificateContent = {
      pdf: pdf('cert-pdf', 'Certificate of Authenticity (PDF)'),
      image: { label: 'Certificate image', status: 'pending' },
    };
    const { container } = renderUi(<CertificateView certificate={certificate} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelectorAll('iframe')).toHaveLength(1);
    expect(screen.queryByText(/Pending/)).toBeNull();
  });
});
