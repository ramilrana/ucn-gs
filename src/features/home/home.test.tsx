import { render, screen, within } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { about as realAbout, home as realHome, site as realSite } from '../../content';
import HomePage from '../../pages/HomePage';
import type { AboutContent, HomeContent, ImageAsset, LeaderMessage, SiteContent } from '../../types/content';
import { HomeView } from './HomeView';
import { LeaderMessageCard } from './LeaderMessageCard';
import { QuickAccess } from './QuickAccess';

const renderUi = (ui: React.ReactElement, path = '/') => {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
};

const production = () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_CONTENT_PREVIEW', '');
};

afterEach(() => {
  vi.unstubAllEnvs();
  document.title = '';
});

const image = (name: string): ImageAsset => ({ src: `/assets/${name}.jpg`, width: 800, height: 500, alt: name });
const YT = 'dQw4w9WgXcQ';

const site: SiteContent = {
  ...realSite,
  programName: { status: 'published', label: 'Program', value: 'Sample Program Name' },
};

const fullHome: HomeContent = {
  leadershipSlides: { status: 'published', label: 'Leadership', value: [image('Leadership slide')] },
  accreditationSlide1: { status: 'published', label: 'Slide 1', value: image('Accreditation slide one') },
  accreditationHeading: 'LEVEL IV AACCUP ACCREDITATION',
  accreditationSlide2: { status: 'published', label: 'Slide 2', value: image('Accreditation slide two') },
  gallery: { status: 'published', label: 'Gallery', value: [image('Gallery photo')] },
  video: {
    id: 'home-video',
    title: 'Graduate School video',
    format: 'video',
    status: 'published',
    source: { kind: 'youtube', videoId: YT },
  },
  presidentMessage: {
    status: 'published',
    label: 'President',
    value: { name: 'Sample President', position: 'President', paragraphs: ['President words.'] },
  },
  deanMessage: {
    status: 'published',
    label: 'Dean',
    value: { name: 'Sample Dean', position: 'Dean', photo: image('Dean photo'), paragraphs: ['Dean words.'] },
  },
  programChairMessage: {
    status: 'published',
    label: 'Chair',
    value: { name: 'Sample Chair', position: 'Program Chair', paragraphs: ['Chair words.'] },
  },
};

const fullAbout: AboutContent = {
  intro: { status: 'published', label: 'About introduction', value: ['Intro first.'] },
  photo: { status: 'published', label: 'About photograph', value: image('About photo') },
  mission: { status: 'published', label: 'Mission', value: ['Mission first.', 'Mission second.'] },
  vision: { status: 'published', label: 'Vision', value: ['Vision first.'] },
  qualityPolicy: { status: 'published', label: 'Quality Policy', value: ['Quality first.'] },
  goals: { status: 'published', label: 'Goals', value: ['Goals first.', 'Goals second.'] },
  objectives: {
    status: 'published',
    label: 'Objectives',
    value: [{ program: 'Sample Program Objectives', text: ['Objectives first.'] }],
  },
  programDescriptions: {
    status: 'published',
    label: 'Program Description',
    value: [{ program: 'Sample Program', text: ['Description first.'] }],
  },
  history: { status: 'published', label: 'History', value: ['History first.', 'History second.'] },
  deans: { status: 'published', label: 'Deans', value: ['Dean One (2000 - 2001)'] },
};

/** Every slot pending, as before any UCN material arrived. */
const pendingHome: HomeContent = {
  ...realHome,
  leadershipSlides: { status: 'pending', label: realHome.leadershipSlides.label },
  presidentMessage: { status: 'pending', label: realHome.presidentMessage.label },
  deanMessage: { status: 'pending', label: realHome.deanMessage.label },
  programChairMessage: { status: 'pending', label: realHome.programChairMessage.label },
};
const pendingAbout: AboutContent = {
  photo: { status: 'pending', label: 'About photograph' },
  intro: { status: 'pending', label: 'About introduction' },
  mission: { status: 'pending', label: 'Mission' },
  vision: { status: 'pending', label: 'Vision' },
  qualityPolicy: { status: 'pending', label: 'Quality Policy' },
  goals: { status: 'pending', label: 'Goals' },
  objectives: { status: 'pending', label: 'Objectives' },
  programDescriptions: { status: 'pending', label: 'Program Description' },
  history: { status: 'pending', label: 'History' },
  deans: { status: 'pending', label: 'Deans' },
};

/** The page's outline: headings, named landmarks, and the key images and controls, in document order. */
function outline(container: HTMLElement): string[] {
  const nodes = container.querySelectorAll<HTMLElement>(
    'h1, h2, h3, nav[aria-label], section[aria-label], img[alt^="Accreditation slide"], img[alt="About photo"], button[aria-label^="Play video"]',
  );
  return Array.from(nodes).map((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'nav' || tag === 'section') return `${tag}: ${el.getAttribute('aria-label')}`;
    if (tag === 'img') return `img: ${el.getAttribute('alt')}`;
    if (tag === 'button') return 'video player';
    return `${tag}: ${el.textContent}`;
  });
}

describe('HomeView', () => {
  it('renders sections in the required order', () => {
    const { container } = renderUi(<HomeView home={fullHome} about={fullAbout} site={site} />);
    expect(outline(container)).toEqual([
      'h1: University of Camarines Norte Graduate School',
      'section: Graduate School leadership',
      'nav: Principal accreditation resources',
      'img: Accreditation slide one',
      'h2: LEVEL IV AACCUP ACCREDITATION',
      'img: Accreditation slide two',
      'section: Graduate School gallery',
      'section: Graduate School video',
      'video player',
      'h2: Messages',
      'h3: Sample President',
      'h3: Sample Dean',
      'h3: Sample Chair',
      'h2: About the Graduate School',
      'img: About photo',
      'h3: Mission and Vision',
      'h3: Goals and Objectives',
      'h3: History',
    ]);
  });

  it('hero shows the university (gold) and school on separate lines over a decorative campus photo', () => {
    renderUi(<HomeView home={fullHome} about={fullAbout} site={site} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.id).toBe('page-title');
    expect(h1.getAttribute('tabindex')).toBe('-1');
    // The accessible name keeps a space between the two lines.
    expect(h1.textContent).toBe(`${site.universityName} ${site.schoolName}`);
    const [university, school] = Array.from(h1.querySelectorAll('span'));
    expect(university?.className).toContain('block');
    expect(university?.className).toContain('text-gold-500');
    expect(school?.className).toContain('block');
    const hero = h1.closest('.on-maroon') as HTMLElement;
    expect(within(hero).getByText('Sample Program Name')).toBeTruthy();
    const photo = hero.querySelector('img');
    expect(photo?.getAttribute('alt')).toBe('');
    // The leadership carousel follows the hero directly, full width.
    const carousel = hero.nextElementSibling as HTMLElement;
    expect(carousel.getAttribute('aria-label')).toBe('Graduate School leadership');
    expect(carousel.className).toContain('w-full');
  });

  it('heading text is exactly LEVEL IV AACCUP ACCREDITATION', () => {
    renderUi(<HomeView home={fullHome} about={fullAbout} site={site} />);
    const heading = screen.getByRole('heading', { level: 2, name: 'LEVEL IV AACCUP ACCREDITATION' });
    expect(heading.textContent).toBe('LEVEL IV AACCUP ACCREDITATION');
  });

  it('quick access has four links with descriptive names', () => {
    renderUi(<HomeView home={fullHome} about={fullAbout} site={site} />);
    const nav = screen.getByRole('navigation', { name: 'Principal accreditation resources' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Certificate of Authenticity', '/certificate-of-authenticity'],
      ['Compliance Report', '/compliance-report'],
      ['Accreditation Areas', '/accreditation-areas'],
      ['Audio Visual Presentations', '/avp'],
    ]);
    // Each tile has its own decorative icon (hidden from screen readers), not an arrow.
    for (const link of links) expect(link.querySelector('span[aria-hidden="true"] svg')).not.toBeNull();
  });

  it('quick access uses the configured areas label', () => {
    renderUi(<HomeView home={fullHome} about={fullAbout} site={{ ...site, areasLabel: 'Accreditation Scope' }} />);
    const nav = screen.getByRole('navigation', { name: 'Principal accreditation resources' });
    expect(within(nav).getByRole('link', { name: 'Accreditation Scope' })).toBeTruthy();
  });

  it('about previews show the first paragraph and link to the about anchors', () => {
    renderUi(<HomeView home={fullHome} about={fullAbout} site={site} />);
    expect(screen.getByText('Mission first.')).toBeTruthy();
    expect(screen.getByText('Vision first.')).toBeTruthy();
    // Same order as the About page: Vision, then Mission.
    expect(
      screen.getByText('Vision first.').compareDocumentPosition(screen.getByText('Mission first.')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText('Goals first.')).toBeTruthy();
    // Objectives are per-program lists, so the Goals and Objectives preview quotes the goal only.
    expect(screen.queryByText('Objectives first.')).toBeNull();
    expect(screen.getByText('History first.')).toBeTruthy();
    expect(screen.queryByText('Mission second.')).toBeNull();
    expect(screen.queryByText('History second.')).toBeNull();
    const hrefs = screen
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
      .filter((h) => h?.startsWith('/about'));
    expect(hrefs).toEqual(['/about#mission-and-vision', '/about#goals-and-objectives', '/about#history']);
  });

  it('shows a pending notice for each missing slot in development', () => {
    renderUi(<HomeView home={pendingHome} about={pendingAbout} site={realSite} />);
    expect(screen.getAllByRole('note').length).toBeGreaterThanOrEqual(8);
    expect(screen.getByText('Pending: First accreditation slide')).toBeTruthy();
    expect(screen.queryByText('Accreditation materials are being prepared.')).toBeNull();
  });

  it('all-pending production home is not an empty shell', () => {
    production();
    renderUi(<HomeView home={pendingHome} about={pendingAbout} site={realSite} />);
    expect(screen.getByRole('heading', { level: 1, name: 'University of Camarines Norte Graduate School' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Principal accreditation resources' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: realHome.accreditationHeading })).toBeTruthy();
    expect(screen.getByText('Accreditation materials are being prepared.')).toBeTruthy();
    expect(screen.queryAllByRole('note')).toHaveLength(0);
    expect(screen.queryByRole('heading', { level: 2, name: 'Messages' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 2, name: 'About the Graduate School' })).toBeNull();
  });

  it('production hides pending slots but keeps published ones, without the empty note', () => {
    production();
    const partial: HomeContent = {
      ...pendingHome,
      accreditationSlide1: fullHome.accreditationSlide1,
    };
    const { container } = renderUi(<HomeView home={partial} about={pendingAbout} site={realSite} />);
    expect(outline(container)).toContain('img: Accreditation slide one');
    expect(screen.queryByText('Accreditation materials are being prepared.')).toBeNull();
    expect(screen.queryAllByRole('note')).toHaveLength(0);
  });

  it('shows only the program name when published, and omits it otherwise', () => {
    production();
    const { unmount } = renderUi(<HomeView home={realHome} about={realAbout} site={realSite} />);
    expect(screen.queryByText('Sample Program Name')).toBeNull();
    unmount();
    renderUi(<HomeView home={realHome} about={realAbout} site={site} />);
    expect(screen.getByText('Sample Program Name')).toBeTruthy();
  });
});

describe('LeaderMessageCard', () => {
  const message: LeaderMessage = {
    name: 'Sample Dean',
    position: 'Dean',
    photo: image('Dean photo'),
    paragraphs: ['First paragraph.', 'Second paragraph.'],
  };

  it('shows the photo, then the name and position, then the paragraphs', () => {
    const { container } = render(<LeaderMessageCard message={message} />);
    const order = Array.from(container.querySelectorAll('img, h3, p')).map((el) =>
      el.tagName === 'IMG' ? `img:${el.getAttribute('alt')}` : el.textContent,
    );
    expect(order).toEqual(['img:Dean photo', 'Sample Dean', 'Dean', 'First paragraph.', 'Second paragraph.']);
  });

  it('renders without a photo and never invents one', () => {
    const { container } = render(<LeaderMessageCard message={{ ...message, photo: undefined }} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('heading', { level: 3, name: 'Sample Dean' })).toBeTruthy();
  });

  it('uses a given placeholder photo only when there is no real photo', () => {
    const placeholder = image('Placeholder scenery');
    const { container, unmount } = render(
      <LeaderMessageCard message={{ ...message, photo: undefined }} placeholderPhoto={placeholder} />,
    );
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('Placeholder scenery');
    unmount();
    const real = render(<LeaderMessageCard message={message} placeholderPhoto={placeholder} />);
    expect(real.container.querySelector('img')?.getAttribute('alt')).toBe('Dean photo');
  });
});

describe('HomeView messages', () => {
  it('stacks President, Dean and Program Chair in that order, passing each placeholder to its card', () => {
    const placeholders = { president: image('P stand-in'), dean: image('D stand-in'), programChair: image('C stand-in') };
    const noPhotos: HomeContent = {
      ...fullHome,
      deanMessage: { status: 'published', label: 'Dean', value: { name: 'Sample Dean', position: 'Dean', paragraphs: ['x'] } },
    };
    renderUi(<HomeView home={noPhotos} about={fullAbout} site={site} messagePlaceholders={placeholders} />);
    const section = screen.getByRole('heading', { level: 2, name: 'Messages' }).closest('section') as HTMLElement;
    const order = Array.from(section.querySelectorAll('article')).map((card) => [
      card.querySelector('h3')?.textContent,
      card.querySelector('img')?.getAttribute('alt'),
    ]);
    expect(order).toEqual([
      ['Sample President', 'P stand-in'],
      ['Sample Dean', 'D stand-in'],
      ['Sample Chair', 'C stand-in'],
    ]);
  });

  it('shows no placeholder when none is passed (production)', () => {
    production();
    renderUi(<HomeView home={fullHome} about={fullAbout} site={site} />);
    const section = screen.getByRole('heading', { level: 2, name: 'Messages' }).closest('section') as HTMLElement;
    const alts = Array.from(section.querySelectorAll('img')).map((img) => img.getAttribute('alt'));
    expect(alts).toEqual(['Dean photo']);
  });
});

describe('HomePage', () => {
  it('home sets the plain site title', async () => {
    renderUi(<HomePage />);
    await vi.waitFor(() => expect(document.title).toBe('UCN Graduate School Accreditation'));
  });

  it('home renders exactly one h1', () => {
    renderUi(<HomePage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});

describe('QuickAccess', () => {
  it('uses shrinkable grid tracks so 200% text never overflows', () => {
    renderUi(<QuickAccess areasLabel="Accreditation Areas" />);
    const list = screen.getByRole('navigation', { name: 'Principal accreditation resources' }).querySelector('ul');
    expect(list?.className).toContain('grid-cols-1');
    expect(screen.getAllByRole('link')).toHaveLength(4);
    // A long word wraps inside the tile instead of pushing it past the viewport.
    const label = screen.getByRole('link', { name: 'Accreditation Areas' }).querySelector('span:last-child');
    expect(label?.className).toContain('min-w-0');
    expect(label?.className).toContain('break-words');
  });
});
