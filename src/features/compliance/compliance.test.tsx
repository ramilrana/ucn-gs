import { render, screen, within } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sampleRecommendations } from '../../dev/samples';
import type { EvidenceGroup, Recommendation, Resource, Slot } from '../../types/content';
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
  blocks: [{ type: 'document', resource: pdf(`${id}-doc`, `${title} document`, OTHER_ID), embed: false }],
  ...extra,
});

const makeRec = (extra: Partial<Recommendation> = {}): Recommendation => ({
  number: 2,
  title: 'Strengthen research output',
  status: 'published',
  statement: ['The recommendation statement.'],
  document: pdf('rec-2-doc', 'Recommendation 2 document'),
  evidence: [group('e1', 'First evidence'), group('e2', 'Second evidence')],
  additionalFiles: [pdf('extra', 'Extra file')],
  ...extra,
});

const siblings = [
  { title: 'Recommendation 1', path: '/compliance-report/recommendation-1' },
  { title: 'Recommendation 2', path: '/compliance-report/recommendation-2' },
  { title: 'Recommendation 3', path: '/compliance-report/recommendation-3' },
];

/** PageShell's breadcrumbs read route data, so views render inside a data router. */
const renderUi = (ui: React.ReactElement, path = '/compliance-report/recommendation-2') => {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
};

const production = () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_CONTENT_PREVIEW', '');
};

const pendingOverview: Slot<string[]> = { label: 'Compliance Report overview', status: 'pending' };

describe('ComplianceIndexView', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('index lists recommendations as "Recommendation N: title"', () => {
    production();
    const recs = [
      makeRec({ number: 1, title: 'First title' }),
      makeRec({ number: 2, title: 'Hidden', status: 'pending' }),
      makeRec({ number: 3, title: 'Third title' }),
    ];
    renderUi(
      <ComplianceIndexView
        overview={{ label: 'Compliance Report overview', status: 'published', value: ['Overview paragraph.'] }}
        recommendations={recs}
      />,
      '/compliance-report',
    );
    expect(screen.getByText('Overview paragraph.')).toBeTruthy();
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    const items = within(list).getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(['Recommendation 1: First title', 'Recommendation 3: Third title']);
    const link = within(items[1] as HTMLElement).getByRole('link');
    expect(link.getAttribute('href')).toBe('/compliance-report/recommendation-3');
  });

  it('index with a pending overview and nothing visible shows the preparing note', () => {
    production();
    renderUi(
      <ComplianceIndexView overview={pendingOverview} recommendations={[makeRec({ status: 'pending' })]} />,
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
    renderUi(<RecommendationView rec={makeRec()} siblings={siblings} />);
    expect(screen.getByText('The recommendation statement.')).toBeTruthy();
    expect(screen.getByText('Strengthen research output')).toBeTruthy();
    const headings = screen.getAllByRole('heading').map((h) => `${h.tagName}:${h.textContent}`);
    expect(headings).toEqual([
      'H1:Recommendation 2',
      'H2:Recommendation document',
      'H2:Evidence of Compliance',
      'H3:Evidence 1: First evidence',
      'H3:Evidence 2: Second evidence',
      'H2:Additional Files',
    ]);
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
    renderUi(<RecommendationView rec={rec} siblings={siblings} />);
    const h3s = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(h3s).toEqual(['Evidence 1: First evidence', 'Evidence 2: Third evidence']);
  });

  it('numbers by visible position when a published group has only pending blocks', () => {
    production();
    const pendingBlocks = group('empty', 'Only pending', {
      blocks: [{ type: 'document', resource: { id: 'x', title: 'X', format: 'pdf', status: 'pending' } }],
    });
    const rec = makeRec({ evidence: [pendingBlocks, group('e2', 'Real evidence')] });
    renderUi(<RecommendationView rec={rec} siblings={siblings} />);
    const h3s = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(h3s).toEqual(['Evidence 1: Real evidence']);
  });

  it('recommendation document is embedded', () => {
    production();
    const { container } = renderUi(<RecommendationView rec={makeRec()} siblings={siblings} />);
    const frames = container.querySelectorAll('iframe');
    expect(frames).toHaveLength(1);
    expect(frames[0]?.getAttribute('title')).toBe('Recommendation 2 document (PDF)');
    expect(screen.getByRole('button', { name: /Preview First evidence document/ })).toBeTruthy();
  });

  it('pager links neighbours', () => {
    production();
    renderUi(<RecommendationView rec={makeRec()} siblings={siblings} />);
    const pager = screen.getByRole('navigation', { name: 'Pager' });
    expect(within(pager).getByRole('link', { name: /Previous: Recommendation 1/ }).getAttribute('href')).toBe(
      '/compliance-report/recommendation-1',
    );
    expect(within(pager).getByRole('link', { name: /Next: Recommendation 3/ }).getAttribute('href')).toBe(
      '/compliance-report/recommendation-3',
    );
  });

  it('shows the preparing note when nothing is publishable in production', () => {
    production();
    const rec = makeRec({
      statement: undefined,
      document: { id: 'd', title: 'Doc', format: 'pdf', status: 'pending' },
      evidence: [group('e1', 'Hidden', { status: 'pending' })],
      additionalFiles: [],
    });
    renderUi(<RecommendationView rec={rec} siblings={siblings} />);
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
  });

  it('renders the DEV sample recommendation without errors', () => {
    const sample = sampleRecommendations[0] as Recommendation;
    renderUi(
      <RecommendationView rec={sample} siblings={[{ title: 'Recommendation 99', path: '/compliance-report/recommendation-99' }]} />,
      '/compliance-report/recommendation-99',
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Recommendation 99');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
  });
});
