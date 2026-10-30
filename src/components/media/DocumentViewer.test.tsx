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
    const button = screen.getByRole('button', { name: 'Preview Narrative Report' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    await user.click(button);
    expect(screen.getByTitle('Narrative Report (PDF)')).toBeTruthy();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    await user.click(button);
    expect(screen.queryByTitle(/PDF/)).toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('local PDF without inline viewer shows fallback card', () => {
    Object.defineProperty(navigator, 'pdfViewerEnabled', { value: false, configurable: true, writable: true });
    renderViewer(<DocumentViewer resource={localPdf({ downloadable: true })} mode="embedded" />);
    expect(screen.queryByTitle(/PDF/)).toBeNull();
    expect(screen.getByText("Your browser can't show this PDF here.")).toBeTruthy();
    expect(screen.getByRole('link', { name: /Open PDF/ }).getAttribute('href')).toBe('/files/report.pdf');
    expect(screen.getAllByRole('link', { name: /Download/ }).length).toBe(2);
  });

  it('drive PDF always uses the frame even without an inline viewer', () => {
    Object.defineProperty(navigator, 'pdfViewerEnabled', { value: false, configurable: true, writable: true });
    renderViewer(<DocumentViewer resource={drivePdf()} mode="embedded" />);
    expect(screen.getByTitle('Narrative Report (PDF)')).toBeTruthy();
    expect(screen.queryByText("Your browser can't show this PDF here.")).toBeNull();
  });

  it('local PDF with inline viewer embeds the file URL', () => {
    renderViewer(<DocumentViewer resource={localPdf()} mode="embedded" />);
    expect(screen.getByTitle('Local Report (PDF)').getAttribute('src')).toBe('/files/report.pdf');
    expect(screen.getByText('This site')).toBeTruthy();
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
