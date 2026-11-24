import { render, screen, waitFor, within } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sampleRecommendations } from '../../dev/samples';
import type { Area, EvidenceGroup, Recommendation, Resource, Slot } from '../../types/content';
import { ComplianceIndexView } from './ComplianceIndexView';
import { RecommendationView } from './RecommendationView';

const FILE_ID = '1AbCdEfGhIjKlMnOpQrStUvWx';
const OTHER_ID = '2ZyXwVuTsRqPoNmLkJiHgFeDc';

const pdf = (id: string, title: string, fileId = FILE_ID): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

const group = (id: string, title: string, extra: Partial<EvidenceGroup> = {}): EvidenceGroup => ({
  id,
  title,
  status: 'published',
  blocks: [
    {
      type: 'document',
      resource: pdf(`${id}-doc`, `${title} document`, OTHER_ID),
      embed: false,
    },
  ],
  ...extra,
});

const makeRec = (extra: Partial<Recommendation> = {}): Recommendation => ({
  areaSlug: 'research',
  number: 2,
  title: 'Strengthen research output',
  status: 'published',
  statement: ['The recommendation statement.'],
  document: pdf('rec-2-doc', 'Recommendation 2 document'),
  evidence: [group('e1', 'First evidence'), group('e2', 'Second evidence')],
  additionalFiles: [pdf('extra', 'Extra file')],
  ...extra,
});

const makeArea = (slug: string, order: number, title: string, status: Area['status'] = 'published'): Area => ({
  slug,
  order,
  title,
  status,
  gallery: { label: 'Gallery', status: 'pending' },
  narrativeReport: {
    id: `${slug}-nr`,
    title: 'Narrative',
    format: 'pdf',
    status: 'pending',
  },
  groups: [],
  additionalFiles: [],
});

const research = makeArea('research', 1, 'Research');
const community = makeArea('community-service', 2, 'Community Service');

const TITLE = 'Research: Recommendation 2';
const PATH = '/compliance-report/research/recommendation-2';

const siblings = [
  {
    title: 'Research: Recommendation 1',
    path: '/compliance-report/research/recommendation-1',
  },
  { title: TITLE, path: PATH },
  {
    title: 'Community Service: Recommendation 1',
    path: '/compliance-report/community-service/recommendation-1',
  },
];

/** PageShell's breadcrumbs read route data, so views render inside a data router. */
const renderUi = (ui: React.ReactElement, path = PATH) => {
  const router = createMemoryRouter([{ path: '*', element: ui }], {
    initialEntries: [path],
  });
  return { ...render(<RouterProvider router={router} />), router };
};

const production = () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_CONTENT_PREVIEW', '');
};

const pendingOverview: Slot<string[]> = {
  label: 'Compliance Report overview',
  status: 'pending',
};

describe('ComplianceIndexView', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('index groups recommendations under area headings in area order', () => {
    production();
    const recs = [
      makeRec({
        areaSlug: 'community-service',
        number: 1,
        title: 'Community title',
      }),
      makeRec({ number: 1, title: 'First title' }),
      makeRec({ number: 2, title: 'Hidden', status: 'pending' }),
      makeRec({ number: 3, title: 'Third title' }),
    ];
    renderUi(
      <ComplianceIndexView
        overview={{
          label: 'Compliance Report overview',
          status: 'published',
          value: ['Overview paragraph.'],
        }}
        areas={[community, research]}
        recommendations={recs}
      />,
      '/compliance-report',
    );
    expect(screen.getByText('Overview paragraph.')).toBeTruthy();
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual(['Research', 'Community Service']);
    const sections = headings.map((h) => h.closest('section') as HTMLElement);
    expect(sections.map((s) => s.id)).toEqual(['research', 'community-service']);
    const lists = screen.getAllByRole('list');
    expect(lists.every((l) => l.tagName === 'OL')).toBe(true);
    expect(
      within(sections[0] as HTMLElement)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Recommendation 1: First title (Research)', 'Recommendation 3: Third title (Research)']);
    expect(
      within(sections[0] as HTMLElement).getByRole('link', { name: 'Recommendation 1: First title (Research)' }),
    ).toBeTruthy();
    const link = within(sections[0] as HTMLElement).getAllByRole('link')[1] as HTMLElement;
    expect(link.getAttribute('href')).toBe('/compliance-report/research/recommendation-3');
    expect(within(sections[1] as HTMLElement).getByRole('link').getAttribute('href')).toBe(
      '/compliance-report/community-service/recommendation-1',
    );
  });

  it('index does not repeat the placeholder title "Recommendation N" after the number', () => {
    production();
    renderUi(
      <ComplianceIndexView
        overview={pendingOverview}
        areas={[research]}
        recommendations={[makeRec({ number: 1, title: 'First title' }), makeRec({ number: 2, title: 'Recommendation 2' })]}
      />,
      '/compliance-report',
    );
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Recommendation 1: First title (Research)',
      'Recommendation 2 (Research)',
    ]);
    expect(screen.getByRole('link', { name: 'Recommendation 2 (Research)' })).toBeTruthy();
  });

  it('index hides an area whose recommendations are all hidden, and a pending area', () => {
    production();
    const recs = [makeRec({ number: 1, status: 'pending' }), makeRec({ areaSlug: 'community-service', number: 1 })];
    renderUi(
      <ComplianceIndexView
        overview={pendingOverview}
        areas={[research, makeArea('community-service', 2, 'Community Service', 'pending')]}
        recommendations={recs}
      />,
      '/compliance-report',
    );
    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('index focuses the area section named by the hash', async () => {
    production();
    renderUi(
      <ComplianceIndexView
        overview={pendingOverview}
        areas={[research, community]}
        recommendations={[makeRec({ number: 1 }), makeRec({ areaSlug: 'community-service', number: 1 })]}
      />,
      '/compliance-report#community-service',
    );
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Community Service'));
  });

  it('index with an area hash shows only that area, without the overview, and links back to every area', () => {
    production();
    renderUi(
      <ComplianceIndexView
        overview={{ status: 'published', label: 'Overview', value: ['Overview text.'] }}
        areas={[research, community]}
        recommendations={[makeRec({ number: 1 }), makeRec({ areaSlug: 'community-service', number: 1 })]}
      />,
      '/compliance-report#community-service',
    );
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual(['Community Service']);
    expect(screen.queryByText('Overview text.')).toBeNull();
    expect(screen.getByRole('link', { name: 'Show the recommendations of every area' }).getAttribute('href')).toBe(
      '/compliance-report',
    );
  });

  it('index without a hash, or with an unknown or malformed one, shows every area and the overview', () => {
    production();
    for (const path of ['/compliance-report', '/compliance-report#nope', '/compliance-report#%']) {
      const { unmount } = renderUi(
        <ComplianceIndexView
          overview={{ status: 'published', label: 'Overview', value: ['Overview text.'] }}
          areas={[research, community]}
          recommendations={[makeRec({ number: 1 }), makeRec({ areaSlug: 'community-service', number: 1 })]}
        />,
        path,
      );
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
      expect(screen.getByText('Overview text.')).toBeTruthy();
      expect(screen.queryByRole('link', { name: 'Show the recommendations of every area' })).toBeNull();
      unmount();
    }
  });

  it('index has no "every area" link when only one area has recommendations', () => {
    production();
    renderUi(
      <ComplianceIndexView overview={pendingOverview} areas={[research, community]} recommendations={[makeRec({ number: 1 })]} />,
      '/compliance-report#research',
    );
    expect(screen.queryByRole('link', { name: 'Show the recommendations of every area' })).toBeNull();
  });

  it('index puts the scroll margin on the focused h2, not the section', () => {
    production();
    renderUi(
      <ComplianceIndexView overview={pendingOverview} areas={[research]} recommendations={[makeRec({ number: 1 })]} />,
      '/compliance-report',
    );
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2.className).toContain('scroll-mt-6');
    expect((h2.closest('section') as HTMLElement).className).not.toContain('scroll-mt');
  });

  it('index refocuses the target when the same hash is navigated to again', async () => {
    production();
    const { router } = renderUi(
      <ComplianceIndexView
        overview={pendingOverview}
        areas={[research, community]}
        recommendations={[makeRec({ number: 1 }), makeRec({ areaSlug: 'community-service', number: 1 })]}
      />,
      '/compliance-report#community-service',
    );
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Community Service'));
    (document.activeElement as HTMLElement).blur();
    expect(document.activeElement).toBe(document.body);
    await router.navigate('/compliance-report#community-service');
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Community Service'));
  });

  it('index with a pending overview and nothing visible shows the preparing note', () => {
    production();
    renderUi(
      <ComplianceIndexView
        overview={pendingOverview}
        areas={[research]}
        recommendations={[makeRec({ status: 'pending' })]}
      />,
      '/compliance-report',
    );
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });
});

describe('RecommendationView', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('renders sections in order', () => {
    production();
    renderUi(<RecommendationView rec={makeRec()} title={TITLE} path={PATH} siblings={siblings} />);
    expect(screen.getByText('The recommendation statement.')).toBeTruthy();
    expect(screen.getByText('Strengthen research output')).toBeTruthy();
    const headings = screen.getAllByRole('heading').map((h) => `${h.tagName}:${h.textContent}`);
    expect(headings).toEqual([
      `H1:${TITLE}`,
      'H2:Recommendation document',
      'H2:Evidence of Compliance',
      'H3:Evidence 1: First evidence',
      'H3:Evidence 2: Second evidence',
      'H2:Additional Files',
    ]);
  });

  it('shows the area eyebrow in a banner and hides a placeholder title', () => {
    production();
    renderUi(
      <RecommendationView
        rec={makeRec({ title: 'Recommendation 2' })}
        title={TITLE}
        path={PATH}
        siblings={siblings}
        eyebrow="Area I"
      />,
    );
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.closest('.bg-maroon-800, .from-maroon-800')).toBeTruthy();
    expect(screen.getByText('Area I')).toBeTruthy();
    expect(screen.queryByText('Recommendation 2', { exact: true })).toBeNull();
  });

  it('a link-type recommendation document is headed "Recommendation Link" and opens in a new tab', () => {
    production();
    const url = 'https://docs.google.com/spreadsheets/d/abc/edit?gid=0#gid=0&range=2:2';
    const rec = makeRec({
      document: {
        id: 'matrix',
        title: 'MPA LEVEL 4_COMPLIANCE MATRIX',
        format: 'link',
        status: 'published',
        source: { kind: 'external', url },
      },
    });
    const { container } = renderUi(<RecommendationView rec={rec} title={TITLE} path={PATH} siblings={siblings} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Recommendation Link' })).toBeTruthy();
    const link = screen.getByRole('link', { name: /Open in new tab\s*MPA LEVEL 4_COMPLIANCE MATRIX/ });
    expect(link.getAttribute('href')).toBe(url);
    expect(container.querySelectorAll('iframe')).toHaveLength(0);
  });

  it('evidence is numbered by visible position', () => {
    production();
    const rec = makeRec({
      evidence: [
        group('e1', 'First evidence'),
        group('mid', 'Pending middle', { status: 'pending' }),
        group('e3', 'Third evidence'),
      ],
    });
    renderUi(<RecommendationView rec={rec} title={TITLE} path={PATH} siblings={siblings} />);
    const h3s = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(h3s).toEqual(['Evidence 1: First evidence', 'Evidence 2: Third evidence']);
  });

  it('numbers by visible position when a published group has only pending blocks', () => {
    production();
    const pendingBlocks = group('empty', 'Only pending', {
      blocks: [
        {
          type: 'document',
          resource: { id: 'x', title: 'X', format: 'pdf', status: 'pending' },
        },
      ],
    });
    const rec = makeRec({
      evidence: [pendingBlocks, group('e2', 'Real evidence')],
    });
    renderUi(<RecommendationView rec={rec} title={TITLE} path={PATH} siblings={siblings} />);
    const h3s = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(h3s).toEqual(['Evidence 1: Real evidence']);
  });

  it('recommendation document is embedded', () => {
    production();
    const { container } = renderUi(
      <RecommendationView rec={makeRec()} title={TITLE} path={PATH} siblings={siblings} />,
    );
    const frames = container.querySelectorAll('iframe');
    expect(frames).toHaveLength(1);
    expect(frames[0]?.getAttribute('title')).toBe('Recommendation 2 document (PDF)');
    expect(screen.getByRole('button', { name: /Preview First evidence document/ })).toBeTruthy();
  });

  it('pager links neighbours', () => {
    production();
    renderUi(<RecommendationView rec={makeRec()} title={TITLE} path={PATH} siblings={siblings} />);
    const pager = screen.getByRole('navigation', { name: 'Pager' });
    expect(
      within(pager)
        .getByRole('link', { name: /Previous: Research: Recommendation 1/ })
        .getAttribute('href'),
    ).toBe('/compliance-report/research/recommendation-1');
    expect(
      within(pager)
        .getByRole('link', {
          name: /Next: Community Service: Recommendation 1/,
        })
        .getAttribute('href'),
    ).toBe('/compliance-report/community-service/recommendation-1');
  });

  it('shows the preparing note when nothing is publishable in production', () => {
    production();
    const rec = makeRec({
      statement: undefined,
      document: { id: 'd', title: 'Doc', format: 'pdf', status: 'pending' },
      evidence: [group('e1', 'Hidden', { status: 'pending' })],
      additionalFiles: [],
    });
    renderUi(<RecommendationView rec={rec} title={TITLE} path={PATH} siblings={siblings} />);
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
  });

  it('renders the DEV sample recommendation without errors', () => {
    const sample = sampleRecommendations[0] as Recommendation;
    renderUi(
      <RecommendationView
        rec={sample}
        title="Sample area: Recommendation 1"
        path="/compliance-report/sample-area/recommendation-1"
        siblings={[
          {
            title: 'Sample area: Recommendation 1',
            path: '/compliance-report/sample-area/recommendation-1',
          },
        ]}
      />,
      '/compliance-report/sample-area/recommendation-1',
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Sample area: Recommendation 1');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
  });
});
