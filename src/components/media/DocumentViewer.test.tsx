import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Resource } from '../../types/content';
import { DocumentViewer } from './DocumentViewer';

const FILE_ID = '1AbCdEfGhIjKlMnOpQrStUvWx';

const drivePdf = (extra: Partial<Resource> = {}): Resource =>
  ({
    id: 'doc-1',
    title: 'Narrative Report',
    format: 'pdf',
    status: 'published',
    source: { kind: 'drive', fileId: FILE_ID },
    ...extra,
  }) as Resource;

const localPdf = (extra: Partial<Resource> = {}): Resource =>
  ({
    id: 'doc-2',
    title: 'Local Report',
    format: 'pdf',
    status: 'published',
    source: { kind: 'local', path: '/files/report.pdf' },
    ...extra,
  }) as Resource;

const renderViewer = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('DocumentViewer', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    Object.defineProperty(navigator, 'pdfViewerEnabled', { value: true, configurable: true, writable: true });
  });

  it('embedded drive PDF renders a sandboxed iframe with preview URL and title', () => {
    renderViewer(<DocumentViewer resource={drivePdf()} mode="embedded" />);
    const frame = screen.getByTitle('Narrative Report (PDF)');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toBe(`https://drive.google.com/file/d/${FILE_ID}/preview`);
    expect(frame.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin allow-popups allow-presentation');
    expect(frame.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin');
    expect(frame.getAttribute('loading')).toBe('lazy');
    expect(frame.getAttribute('allow')).toBe('fullscreen');
    const open = screen.getByRole('link', { name: /Open in new tab/ });
    expect(open.getAttribute('href')).toBe(`https://drive.google.com/file/d/${FILE_ID}/view`);
    expect(open.getAttribute('target')).toBe('_blank');
    expect(screen.getByText('Narrative Report').tagName).not.toMatch(/^H[1-6]$/);
    expect(screen.getByText('PDF')).toBeTruthy();
    expect(screen.getByText('Google Drive')).toBeTruthy();
  });

  it('on-demand mode renders no iframe until Preview is pressed', async () => {
    const user = userEvent.setup();
    renderViewer(<DocumentViewer resource={drivePdf()} mode="on-demand" />);
    expect(screen.queryByTitle(/PDF/)).toBeNull();
    // The Open link must exist before Preview, in case the Drive file is not shared publicly (Review Focus 1).
    const open = screen.getByRole('link', { name: /Open in new tab/ });
    expect(open.getAttribute('href')).toBe(`https://drive.google.com/file/d/${FILE_ID}/view`);
    const button = screen.getByRole('button', { name: 'Preview Narrative Report' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    await user.click(button);
    expect(screen.getByTitle('Narrative Report (PDF)')).toBeTruthy();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    await user.click(button);
    expect(screen.queryByTitle(/PDF/)).toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('embedded local PDF renders no iframe, only a card with Open and Download links', () => {
    const { container } = renderViewer(<DocumentViewer resource={localPdf({ downloadable: true })} mode="embedded" />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText('Local Report').tagName).not.toMatch(/^H[1-6]$/);
    expect(screen.getByText('Open this PDF in a new tab or download it.')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Open PDF/ }).getAttribute('href')).toBe('/files/report.pdf');
    expect(screen.getAllByRole('link', { name: /Download/ })).toHaveLength(1);
    expect(screen.getByRole('link', { name: /Download/ }).getAttribute('href')).toBe('/files/report.pdf');
    expect(screen.getByText('This site')).toBeTruthy();
  });

  it('embedded local PDF that is not downloadable offers Open but no Download', () => {
    const { container } = renderViewer(<DocumentViewer resource={localPdf()} mode="embedded" />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('link', { name: /Open PDF/ }).getAttribute('href')).toBe('/files/report.pdf');
    expect(screen.queryByRole('link', { name: /Download/ })).toBeNull();
  });

  it('on-demand local PDF has no Preview button and no iframe', () => {
    const { container } = renderViewer(<DocumentViewer resource={localPdf({ downloadable: true })} mode="on-demand" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('link', { name: /Open PDF/ }).getAttribute('href')).toBe('/files/report.pdf');
  });

  it('local PDF never embeds regardless of pdfViewerEnabled', () => {
    Object.defineProperty(navigator, 'pdfViewerEnabled', { value: true, configurable: true, writable: true });
    const { container } = renderViewer(<DocumentViewer resource={localPdf()} mode="embedded" />);
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('drive PDF still embeds', () => {
    renderViewer(<DocumentViewer resource={drivePdf()} mode="embedded" />);
    expect(screen.getByTitle('Narrative Report (PDF)')).toBeTruthy();
    expect(screen.queryByText('Open this PDF in a new tab or download it.')).toBeNull();
  });

  it('download link only when downloadable', () => {
    const { unmount } = renderViewer(<DocumentViewer resource={drivePdf()} mode="embedded" />);
    expect(screen.queryByRole('link', { name: /Download/ })).toBeNull();
    unmount();
    renderViewer(<DocumentViewer resource={drivePdf({ downloadable: true })} mode="embedded" />);
    expect(screen.getByRole('link', { name: /Download/ }).getAttribute('href')).toBe(
      `https://drive.google.com/uc?export=download&id=${FILE_ID}`,
    );
  });

  it('pending resource without source shows PendingNotice in dev, nothing in prod', () => {
    const pending = { id: 'p', title: 'Future Report', format: 'pdf', status: 'pending' } as Resource;
    vi.stubEnv('DEV', true);
    const dev = renderViewer(<DocumentViewer resource={pending} mode="embedded" />);
    expect(screen.getByRole('note').textContent).toBe('Pending: Future Report');
    expect(screen.queryByTitle(/PDF/)).toBeNull();
    dev.unmount();

    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_CONTENT_PREVIEW', '');
    const prod = renderViewer(<DocumentViewer resource={pending} mode="embedded" />);
    expect(prod.container.innerHTML).toBe('');
  });

  it('malformed drive id renders actions without iframe', () => {
    const bad = drivePdf({ source: { kind: 'drive', fileId: 'short' } } as Partial<Resource>);
    renderViewer(<DocumentViewer resource={bad} mode="embedded" />);
    expect(screen.queryByTitle(/PDF/)).toBeNull();
    expect(screen.getByText('Narrative Report')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Open in new tab/ })).toBeNull();
  });

  it('on-demand mode with no embed URL shows no preview button', () => {
    const bad = drivePdf({ source: { kind: 'drive', fileId: 'short' } } as Partial<Resource>);
    renderViewer(<DocumentViewer resource={bad} mode="on-demand" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
