import { render, screen, within } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sampleAreas } from '../../dev/samples';
import type { Area, EvidenceGroup, ImageAsset, Resource } from '../../types/content';
import { AreaView } from './AreaView';
import { AreasIndexView } from './AreasIndexView';

const FILE_ID = '1AbCdEfGhIjKlMnOpQrStUvWx';
const OTHER_ID = '2ZyXwVuTsRqPoNmLkJiHgFeDc';

const pdf = (id: string, title: string, fileId = FILE_ID): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

const photo = (n: number): ImageAsset => ({ src: `/p${n}.jpg`, width: 10, height: 10, alt: `Photo ${n}` });

const group = (id: string, title: string, extra: Partial<EvidenceGroup> = {}): EvidenceGroup => ({
  id,
  title,
  status: 'published',
  blocks: [{ type: 'document', resource: pdf(`${id}-doc`, `${title} document`, OTHER_ID), embed: false }],
  ...extra,
});

const makeArea = (extra: Partial<Area> = {}): Area => ({
  slug: 'research',
  order: 1,
  title: 'Research',
  status: 'published',
  summary: ['First summary paragraph.', 'Second summary paragraph.'],
  gallery: { label: 'Research gallery', status: 'published', value: [photo(1), photo(2)] },
  narrativeReport: pdf('research-narrative', 'Research narrative'),
  groups: [group('g1', 'Faculty Research'), group('g2', 'Publications')],
  additionalFiles: [pdf('extra', 'Extra file')],
  ...extra,
});

const siblings = [
  { title: 'Governance', path: '/accreditation-areas/governance' },
  { title: 'Research', path: '/accreditation-areas/research' },
  { title: 'Extension', path: '/accreditation-areas/extension' },
];

/** PageShell's breadcrumbs read route data, so views render inside a data router. */
const renderUi = (ui: React.ReactElement, path = '/accreditation-areas/research') => {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
};

const production = () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_CONTENT_PREVIEW', '');
};

describe('AreasIndexView', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('index lists only visible areas in order', () => {
    production();
    const areas = [
      makeArea({ slug: 'governance', title: 'Governance', order: 1 }),
      makeArea({ slug: 'hidden', title: 'Hidden area', order: 2, status: 'pending' }),
      makeArea({ slug: 'research', title: 'Research', order: 3, summary: ['Only the first paragraph shows.', 'Not this one.'] }),
    ];
    renderUi(<AreasIndexView areas={areas} label="Accreditation Areas" />, '/accreditation-areas');

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Accreditation Areas');
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0] as HTMLElement).getByRole('heading', { level: 2 }).textContent).toBe('Governance');
    expect(within(items[1] as HTMLElement).getByRole('heading', { level: 2 }).textContent).toBe('Research');
    expect(screen.queryByText('Hidden area')).toBeNull();
    expect(screen.getByText('Only the first paragraph shows.')).toBeTruthy();
    expect(screen.queryByText('Not this one.')).toBeNull();
    const link = within(items[1] as HTMLElement).getByRole('link', { name: 'View Research' });
    expect(link.getAttribute('href')).toBe('/accreditation-areas/research');
  });

  it('index with no visible areas shows the preparing note', () => {
    production();
    renderUi(
      <AreasIndexView areas={[makeArea({ status: 'pending' })]} label="Accreditation Areas" />,
      '/accreditation-areas',
    );
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });
});

describe('AreaView', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('area page renders sections in order', () => {
    production();
    renderUi(<AreaView area={makeArea()} siblings={siblings} />);
    const h2s = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual(['Narrative Report', 'Faculty Research', 'Publications', 'Additional Files']);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Research');
    expect(screen.getByRole('region', { name: 'Research photos' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Pager' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Previous: Governance/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Next: Extension/ })).toBeTruthy();
  });

  it('shows a maroon banner (Area I and the title only), then the narrative, then the auto-advancing photos', () => {
    production();
    const { container } = renderUi(<AreaView area={makeArea()} siblings={siblings} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    const banner = h1.closest('.on-maroon') as HTMLElement;
    expect(banner.className).toContain('bg-linear-to-br');
    expect(within(banner).getByText('Area I')).toBeTruthy();
    // No photo and no program line in the banner (user's request 2026-11-22).
    expect(banner.querySelector('img')).toBeNull();
    expect(h1.parentElement?.className).toContain('text-center');
    // Document titles are large maroon serif text with a file icon.
    const docTitle = screen.getAllByText('Research narrative').find((el) => el.tagName === 'SPAN' && el.id) as HTMLElement;
    expect(docTitle.className).toContain('font-serif');
    expect(docTitle.className).toContain('text-maroon-800');
    expect(docTitle.querySelector('svg')).toBeTruthy();
    // Narrative first, then the carousel.
    const narrative = screen.getByRole('heading', { level: 2, name: 'Narrative Report' });
    const carousel = screen.getByRole('region', { name: 'Research photos' });
    expect(narrative.compareDocumentPosition(carousel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(carousel).getByRole('button', { name: 'Pause slideshow' })).toBeTruthy();
    // Section titles sit on maroon bands.
    for (const h2 of screen.getAllByRole('heading', { level: 2 })) {
      expect(h2.className).toContain('text-white');
      expect((h2.parentElement as HTMLElement).className).toContain('bg-maroon-800');
    }
    expect(container.querySelectorAll('[aria-roledescription="carousel"]')).toHaveLength(1);
  });

  it('narrative report is embedded, evidence documents are on-demand', () => {
    production();
    const { container } = renderUi(<AreaView area={makeArea()} siblings={siblings} />);
    const frames = container.querySelectorAll('iframe');
    expect(frames).toHaveLength(1);
    expect(frames[0]?.getAttribute('title')).toBe('Research narrative (PDF)');
    expect(frames[0]?.getAttribute('src')).toBe(`https://drive.google.com/file/d/${FILE_ID}/preview`);
    expect(screen.getByRole('button', { name: /Preview Faculty Research document/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Preview Publications document/ })).toBeTruthy();

    const open = screen.getByRole('link', { name: /^Open the Research narrative report/ });
    expect(open.getAttribute('href')).toBe(`https://drive.google.com/file/d/${FILE_ID}/view`);
  });

  it('shows the Working Checklist right below the photo carousel, before the evidence groups', () => {
    production();
    const checklist: Resource = {
      id: 'research-checklist',
      title: 'Working checklist document',
      format: 'link',
      status: 'published',
      source: { kind: 'external', url: 'https://docs.google.com/document/d/1VdYsxfept_GsuDJc05dujzEVGYCGHAkm/edit' },
    };
    const { container } = renderUi(<AreaView area={makeArea({ workingChecklist: checklist })} siblings={siblings} />);
    const h2s = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual(['Narrative Report', 'Working Checklist', 'Faculty Research', 'Publications', 'Additional Files']);
    const heading = screen.getByRole('heading', { level: 2, name: 'Working Checklist' });
    const carousel = screen.getByRole('region', { name: 'Research photos' });
    const firstGroup = screen.getByRole('heading', { level: 2, name: 'Faculty Research' });
    expect(carousel.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(heading.compareDocumentPosition(firstGroup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // On a maroon band like the other sections.
    expect((heading.parentElement as HTMLElement).className).toContain('bg-maroon-800');
    const section = heading.closest('section') as HTMLElement;
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
    const open = within(section).getByRole('link', { name: /Working checklist document/ });
    expect(open.getAttribute('href')).toBe('https://docs.google.com/document/d/1VdYsxfept_GsuDJc05dujzEVGYCGHAkm/edit');
    expect(open.getAttribute('target')).toBe('_blank');
    // A Google Doc link is never framed: only the narrative frame exists.
    expect(container.querySelectorAll('iframe')).toHaveLength(1);
  });

  it('hides the Working Checklist when it is missing or pending in production', () => {
    production();
    const { unmount } = renderUi(<AreaView area={makeArea()} siblings={siblings} />);
    expect(screen.queryByRole('heading', { name: 'Working Checklist' })).toBeNull();
    unmount();
    renderUi(
      <AreaView
        area={makeArea({ workingChecklist: { id: 'c', title: 'Checklist', format: 'link', status: 'pending' } })}
        siblings={siblings}
      />,
    );
    expect(screen.queryByRole('heading', { name: 'Working Checklist' })).toBeNull();
  });

  it('shows a pending Working Checklist as a pending notice in dev and preview', () => {
    vi.stubEnv('DEV', true);
    renderUi(
      <AreaView
        area={makeArea({ workingChecklist: { id: 'c', title: 'Checklist', format: 'link', status: 'pending' } })}
        siblings={siblings}
      />,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Working Checklist' });
    const section = heading.closest('section') as HTMLElement;
    expect(within(section).getByRole('note').textContent).toBe('Pending: Checklist');
    expect(within(section).queryByRole('link')).toBeNull();
  });

  it('links to its AVP anchor', () => {
    production();
    const avp = { ...pdf('research-avp', 'Research AVP'), format: 'video' as const };
    const { unmount } = renderUi(<AreaView area={makeArea({ avp })} siblings={siblings} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Audio Visual Presentation' })).toBeTruthy();
    const link = screen.getByRole('link', { name: /view the research audio visual presentation/i });
    expect(link.getAttribute('href')).toBe('/avp#research');
    unmount();

    renderUi(
      <AreaView area={makeArea({ avp: { id: 'p', title: 'AVP', format: 'video', status: 'pending' } })} siblings={siblings} />,
    );
    expect(screen.queryByRole('heading', { name: 'Audio Visual Presentation' })).toBeNull();
  });

  it('omits a pending gallery and empty sections in production, with the preparing note when nothing remains', () => {
    production();
    const empty = makeArea({
      gallery: { label: 'Research gallery', status: 'pending' },
      narrativeReport: { id: 'n', title: 'Narrative', format: 'pdf', status: 'pending' },
      groups: [group('g1', 'Pending group', { status: 'pending' })],
      additionalFiles: [],
    });
    renderUi(<AreaView area={empty} siblings={siblings} />);
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
  });

  it('renders the DEV sample area without errors', () => {
    const sample = sampleAreas[0] as Area;
    renderUi(
      <AreaView area={sample} siblings={[{ title: sample.title, path: '/accreditation-areas/sample-area' }]} />,
      '/accreditation-areas/sample-area',
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Sample area');
    const h2s = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual([
      'Narrative Report',
      'Sample 1',
      'Sample 2',
      'Sample 3',
      'Additional Files',
      'Audio Visual Presentation',
    ]);
  });

  it('the DEV sample area frames only the inline sample PDF and offers a Drive Preview button', () => {
    const sample = sampleAreas[0] as Area;
    const { container } = renderUi(
      <AreaView area={sample} siblings={[{ title: sample.title, path: '/accreditation-areas/sample-area' }]} />,
      '/accreditation-areas/sample-area',
    );
    const frames = [...container.querySelectorAll('iframe')];
    expect(frames.length).toBeGreaterThan(0);
    for (const frame of frames) expect(frame.getAttribute('src')).toContain('/files/dev-sample.pdf');
    expect(screen.getByRole('button', { name: /Preview Sample Drive document/ })).toBeTruthy();
  });
});
