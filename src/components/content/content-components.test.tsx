import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EvidenceBlock, EvidenceGroup as EvidenceGroupData, Resource } from '../../types/content';
import { BlockRenderer } from './BlockRenderer';
import { EvidenceGroup } from './EvidenceGroup';
import { ResourceList } from './ResourceList';
import { ResourceRow } from './ResourceRow';
import { blockHasVisibleContent, hasVisibleContent } from './visibility';

const FILE_ID = '1AbCdEfGhIjKlMnOpQrStUvWx';

const pdf = (id: string, title: string, extra: Partial<Resource> = {}): Resource =>
  ({
    id,
    title,
    format: 'pdf',
    status: 'published',
    source: { kind: 'drive', fileId: FILE_ID },
    ...extra,
  }) as Resource;

const pending = (id: string, title: string): Resource => ({ id, title, format: 'pdf', status: 'pending' });

const group = (extra: Partial<EvidenceGroupData> = {}): EvidenceGroupData => ({
  id: 'g1',
  title: 'Faculty Profile',
  status: 'published',
  blocks: [
    { type: 'text', paragraphs: ['Alpha paragraph.'] },
    { type: 'document', resource: pdf('d1', 'Main Document'), embed: false },
    { type: 'resources', items: [pdf('r1', 'Listed Resource', { description: 'About it' })] },
    { type: 'gallery', images: [{ src: '/a.jpg', width: 10, height: 10, alt: 'Alt one' }] },
    {
      type: 'video',
      resource: {
        id: 'v1',
        title: 'Intro Video',
        format: 'video',
        status: 'published',
        source: { kind: 'youtube', videoId: 'dQw4w9WgXcQ' },
      },
    },
  ],
  ...extra,
});

const renderUi = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('content components', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('renders each block type', () => {
    renderUi(<EvidenceGroup group={group()} headingLevel={2} />);
    expect(screen.getByText('Alpha paragraph.')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Main Document' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Preview Main Document/ })).toBeTruthy();
    const list = screen.getByText('About it').closest('ul') as HTMLElement;
    const link = within(list).getByRole('link', { name: /Listed Resource/ });
    expect(link.getAttribute('href')).toBe(`https://drive.google.com/file/d/${FILE_ID}/view`);
    expect(within(list).getByText('About it')).toBeTruthy();
    expect(within(list).getByText('PDF')).toBeTruthy();
    expect(within(list).getByText('Google Drive')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Faculty Profile photos' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Play/i })).toBeTruthy();
  });

  it('numbers evidence when index given', () => {
    const { unmount } = renderUi(<EvidenceGroup group={group()} headingLevel={3} index={2} />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.textContent).toBe('Evidence 2: Faculty Profile');
    expect(screen.getByRole('region', { name: 'Evidence 2: Faculty Profile' })).toBeTruthy();
    unmount();
    renderUi(<EvidenceGroup group={group()} headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Faculty Profile');
  });

  it('shows a pending notice for a visible group with no blocks', () => {
    vi.stubEnv('DEV', true);
    renderUi(<EvidenceGroup group={group({ blocks: [] })} headingLevel={2} />);
    expect(screen.getByRole('note').textContent).toBe('Pending: Faculty Profile');
  });

  it('pending group hidden in production', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_CONTENT_PREVIEW', '');
    const { container } = renderUi(<EvidenceGroup group={group({ status: 'pending' })} headingLevel={2} />);
    expect(container.innerHTML).toBe('');
  });

  it('hides a published group with no visible content in production', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_CONTENT_PREVIEW', '');
    const onlyPending = group({ blocks: [{ type: 'resources', items: [pending('p', 'Hidden')] }] });
    const { container, unmount } = renderUi(<EvidenceGroup group={onlyPending} headingLevel={2} />);
    expect(container.innerHTML).toBe('');
    unmount();
    expect(hasVisibleContent([onlyPending], [])).toBe(false);
    const empty = renderUi(<EvidenceGroup group={group({ blocks: [] })} headingLevel={2} />);
    expect(empty.container.innerHTML).toBe('');
    expect(hasVisibleContent([group({ blocks: [] })], [])).toBe(false);
    empty.unmount();
    const withOne = group({ blocks: [{ type: 'resources', items: [pdf('r1', 'Shown')] }] });
    renderUi(<EvidenceGroup group={withOne} headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Faculty Profile');
    expect(screen.getByRole('link', { name: /Shown/ })).toBeTruthy();
    expect(hasVisibleContent([withOne], [])).toBe(true);
  });

  it('shows heading and pending notice for an empty visible group in dev', () => {
    vi.stubEnv('DEV', true);
    renderUi(<EvidenceGroup group={group({ blocks: [] })} headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Faculty Profile');
    expect(screen.getByRole('note').textContent).toBe('Pending: Faculty Profile');
  });

  it('empty ResourceList renders nothing', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_CONTENT_PREVIEW', '');
    const { container, unmount } = renderUi(<ResourceList items={[]} />);
    expect(container.innerHTML).toBe('');
    unmount();
    const second = renderUi(<ResourceList items={[pending('p', 'Hidden')]} />);
    expect(second.container.innerHTML).toBe('');
  });

  it('ResourceRow shows a download link only when downloadable, and a pending label in dev', () => {
    vi.stubEnv('DEV', true);
    const { unmount } = renderUi(
      <ul>
        <ResourceRow resource={pdf('r', 'Dl', { downloadable: true })} />
      </ul>,
    );
    // Label in name: the visible text comes first, the title follows (jsdom drops the sr-only span's leading space).
    const download = screen.getByRole('link', { name: /^Download\s*Dl$/ });
    expect(download.getAttribute('href')).toContain('export=download');
    unmount();
    // Two rows with a download link stay distinguishable by name (SC 2.4.4).
    const two = renderUi(
      <ul>
        <ResourceRow resource={pdf('a', 'Report A', { downloadable: true })} />
        <ResourceRow resource={pdf('b', 'Report B', { downloadable: true })} />
      </ul>,
    );
    expect(screen.getByRole('link', { name: /^Download\s*Report A$/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /^Download\s*Report B$/ })).toBeTruthy();
    two.unmount();
    renderUi(
      <ul>
        <ResourceRow resource={pending('p', 'Not yet')} />
      </ul>,
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText(/Pending/)).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('ResourceRow renders nothing for a pending resource in production', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_CONTENT_PREVIEW', '');
    const { container } = renderUi(
      <ul>
        <ResourceRow resource={pending('p', 'Not yet')} />
      </ul>,
    );
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('ResourceRow shows plain text when the url is unsafe and omits an empty host label', () => {
    const mail = pdf('m', 'Mail us', { format: 'link', source: { kind: 'external', url: 'mailto:a@b.co' } });
    const bad = pdf('b', 'Bad link', { format: 'link', source: { kind: 'external', url: 'javascript:alert(1)' } });
    renderUi(
      <ul>
        <ResourceRow resource={mail} />
        <ResourceRow resource={bad} />
      </ul>,
    );
    expect(screen.getByRole('link', { name: /Mail us/ }).getAttribute('href')).toBe('mailto:a@b.co');
    expect(screen.getByText('Bad link')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Bad link/ })).toBeNull();
  });

  it('hasVisibleContent is false when everything is pending in prod', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_CONTENT_PREVIEW', '');
    expect(hasVisibleContent([group({ status: 'pending' })], [pending('p', 'x')])).toBe(false);
    expect(hasVisibleContent([], [])).toBe(false);
    expect(hasVisibleContent([group()], [])).toBe(true);
    expect(hasVisibleContent([], [pdf('r', 'Pub')])).toBe(true);
  });
});

describe('unknown block type', () => {
  const bogus = { type: 'nope' } as unknown as EvidenceBlock;

  it('BlockRenderer renders nothing and does not throw', () => {
    const { container } = renderUi(<BlockRenderer block={bogus} />);
    expect(container.innerHTML).toBe('');
  });

  it('blockHasVisibleContent returns false and does not throw', () => {
    expect(blockHasVisibleContent(bogus)).toBe(false);
  });
});
