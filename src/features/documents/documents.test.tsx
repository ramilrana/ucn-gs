import { render, screen, within } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CertificateContent, ImageAsset, Resource, ResourceGroup } from '../../types/content';
import { AdditionalFilesView } from './AdditionalFilesView';
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

describe('AdditionalFilesView', () => {
  afterEach(() => vi.unstubAllEnvs());

  const group = (
    id: string,
    title: string,
    items: Resource[],
    status: ResourceGroup['status'] = 'published',
  ): ResourceGroup => ({ id, title, status, items });

  it('single group omits its heading', () => {
    production();
    renderUi(
      <AdditionalFilesView groups={[group('g1', 'Files for accreditors', [pdf('f1', 'File one')])]} />,
      '/additional-files',
    );
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
    expect(screen.getByRole('list')).toBeTruthy();
  });

  it('multiple groups each get an h2, and groups without visible items are skipped', () => {
    production();
    renderUi(
      <AdditionalFilesView
        groups={[
          group('g1', 'Group A', [pdf('f1', 'File one')]),
          group('g2', 'Group B', [pdf('f2', 'File two')]),
          group('g3', 'Empty group', [pdf('f3', 'Hidden file', 'pending')]),
          group('g4', 'Hidden group', [pdf('f4', 'Another file')], 'pending'),
        ]}
      />,
      '/additional-files',
    );
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Group A', 'Group B']);
    expect(screen.queryByText('Hidden file')).toBeNull();
  });

  it('links use resource titles as text', () => {
    production();
    renderUi(
      <AdditionalFilesView groups={[group('g1', 'Files', [pdf('f1', 'Faculty list'), pdf('f2', 'Policy handbook')])]} />,
      '/additional-files',
    );
    const links = within(screen.getByRole('list')).getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]?.textContent).toContain('Faculty list');
    expect(links[1]?.textContent).toContain('Policy handbook');
  });

  it('with nothing visible shows the preparing note', () => {
    production();
    renderUi(
      <AdditionalFilesView groups={[group('g1', 'Files', [pdf('f1', 'Pending file', 'pending')])]} />,
      '/additional-files',
    );
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
  });
});
