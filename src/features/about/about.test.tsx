import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RootLayout } from '../../app/RootLayout';
import type { AboutContent, ImageAsset, Person } from '../../types/content';
import { AboutView } from './AboutView';
import { FacultyOfProgramsView } from './FacultyOfProgramsView';
import { PeopleView } from './PeopleView';
import { PersonCard } from './PersonCard';
import { groupByRole } from './groupPeople';

const renderUi = (ui: React.ReactElement, path = '/about') => {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
};

const production = () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_CONTENT_PREVIEW', '');
};

const person = (id: string, name: string, over: Partial<Person> = {}): Person => ({
  id,
  name,
  position: 'Instructor',
  role: 'faculty',
  status: 'published',
  ...over,
});

const photo: ImageAsset = { src: '/assets/p-1.jpg', width: 400, height: 500, alt: 'Portrait of Sample Person' };

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

const fullAbout: AboutContent = {
  intro: { status: 'published', label: 'About introduction', value: ['Intro first.'] },
  photo: {
    status: 'published',
    label: 'About photograph',
    value: { src: '/assets/about.jpg', width: 800, height: 500, alt: 'The campus' },
  },
  mission: { status: 'published', label: 'Mission', value: ['Mission text.'] },
  vision: { status: 'published', label: 'Vision', value: ['Vision text.'] },
  qualityPolicy: { status: 'published', label: 'Quality Policy', value: ['Quality policy text.'] },
  goals: { status: 'published', label: 'Goals', value: ['Goal one.', 'Goal two.'] },
  objectives: {
    status: 'published',
    label: 'Program Objectives',
    value: [
      { program: 'Program A Objectives', text: ['Objective one;', 'Objective two.'] },
      { program: 'Program B Objectives', text: ['Objective three.'] },
    ],
  },
  programDescriptions: {
    status: 'published',
    label: 'Program Description',
    value: [
      { program: 'Program A Description', text: ['Description A.'] },
      { program: 'Program B Description', text: ['Description B.'] },
    ],
  },
  history: { status: 'published', label: 'History', value: ['History text.', 'Led by several Deans:'] },
  deans: { status: 'published', label: 'Deans', value: ['Dean One (2000 - 2001)', 'Dean Two (2001 - present)'] },
};

const settle = (ms = 50) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

/** jsdom has no scrollIntoView: define a spy and remove it again in afterEach. */
const stubScroll = () => {
  const spy = vi.fn();
  Object.defineProperty(Element.prototype, 'scrollIntoView', { value: spy, configurable: true, writable: true });
  return spy;
};

const renderInLayout = (path: string) => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <RootLayout />,
        children: [
          { index: true, element: <h1 id="page-title" tabIndex={-1}>Home</h1> },
          { path: 'about', element: <AboutView about={fullAbout} /> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
};

describe('groupByRole', () => {
  it('groupByRole orders and labels groups and drops empty ones', () => {
    const groups = groupByRole([
      person('s1', 'Zed', { role: 'student-assistant' }),
      person('f1', 'Bea', { role: 'faculty' }),
      person('o1', 'Ana', { role: 'official' }),
      person('f2', 'Abe', { role: 'faculty' }),
    ]);
    expect(groups.map((g) => [g.role, g.label])).toEqual([
      ['official', 'Officials'],
      ['faculty', 'Faculty'],
      ['student-assistant', 'Student Assistants'],
    ]);
    // Input order is kept within a group (Bea before Abe).
    expect(groups[1]?.people.map((p) => p.id)).toEqual(['f1', 'f2']);
    expect(groupByRole([])).toEqual([]);
  });
});

describe('PersonCard', () => {
  it('PersonCard without photo renders no img', () => {
    const { container } = render(
      <PersonCard person={person('a', 'Ana Cruz', { postNominals: 'PhD', rank: 'Professor II' })} />,
    );
    expect(container.querySelector('img')).toBeNull();
    const silhouette = container.querySelector('svg');
    expect(silhouette?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('Ana Cruz, PhD')).toBeTruthy();
    expect(screen.getByText('Instructor')).toBeTruthy();
    expect(screen.getByText('Professor II')).toBeTruthy();
  });

  it('PersonCard with a photo renders it, and omits rank and post-nominals when absent', () => {
    const { container } = render(<PersonCard person={person('a', 'Ana Cruz', { photo })} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/assets/p-1.jpg');
    expect(img?.getAttribute('alt')).toBe('Portrait of Sample Person');
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.getByText('Ana Cruz')).toBeTruthy();
  });
});

describe('AboutView', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  it('focuses the section heading named by the hash after navigation, beating the layout focus on the h1', async () => {
    production();
    const scroll = stubScroll();
    const router = renderInLayout('/');
    await act(async () => {
      await router.navigate('/about#history');
    });
    const heading = screen.getByRole('heading', { level: 2, name: 'History' });
    expect(heading.getAttribute('tabindex')).toBe('-1');
    await waitFor(() => expect(document.activeElement).toBe(heading));
    await settle();
    expect(document.activeElement).toBe(heading);
    expect(scroll).toHaveBeenCalled();
  });

  it('focuses the heading when the page is loaded directly at the hash', async () => {
    production();
    stubScroll();
    renderUi(<AboutView about={fullAbout} />, '/about#mission-and-vision');
    const heading = screen.getByRole('heading', { level: 2, name: 'Mission and Vision' });
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  it('focuses nothing for a foreign, unknown or malformed hash', async () => {
    production();
    const scroll = stubScroll();
    for (const hash of ['#main', '#nope', '#%', '#%E0%A4%A']) {
      const { unmount } = renderUi(<AboutView about={fullAbout} />, `/about${hash}`);
      await settle(20);
      expect(document.activeElement?.tagName, hash).toBe('BODY');
      unmount();
    }
    expect(scroll).not.toHaveBeenCalled();
  });

  it('shows the published introduction under the page title, before the photo', () => {
    renderUi(<AboutView about={fullAbout} />);
    const intro = screen.getByText('Intro first.');
    const photo = screen.getByRole('img', { name: 'The campus' });
    expect(intro.compareDocumentPosition(photo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('flows the introduction into two columns from lg, and keeps the page nav as a sticky sidebar before the sections', () => {
    production();
    renderUi(<AboutView about={fullAbout} />);
    const introBody = screen.getByText('Intro first.').parentElement as HTMLElement;
    expect(introBody.className.split(' ')).toContain('lg:columns-2');
    const nav = screen.getByRole('navigation', { name: 'On this page' });
    expect(nav.className.split(' ')).toEqual(expect.arrayContaining(['lg:sticky', 'lg:col-start-2']));
    expect(nav.querySelector('ul')?.className.split(' ')).toContain('lg:flex-col');
    // In the DOM (and so in tab order) the nav still comes before the first section title.
    const firstH2 = screen.getAllByRole('heading', { level: 2 })[0] as HTMLElement;
    expect(nav.compareDocumentPosition(firstH2) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('about sections have stable anchors', () => {
    production();
    const { container } = renderUi(<AboutView about={fullAbout} />);
    for (const id of ['mission-and-vision', 'quality-policy', 'goals-and-objectives', 'program-description', 'history']) {
      const section = container.querySelector(`section#${id}`);
      expect(section, id).not.toBeNull();
      expect(section?.querySelector('h2')).not.toBeNull();
    }
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Mission and Vision',
      'Quality Policy',
      'Goals and Objectives',
      'Program Description',
      'History',
    ]);
    const nav = screen.getByRole('navigation', { name: 'On this page' });
    const hrefs = Array.from(nav.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([
      '#mission-and-vision',
      '#quality-policy',
      '#goals-and-objectives',
      '#program-description',
      '#history',
    ]);
    expect(within(container.querySelector('section#quality-policy') as HTMLElement).getByText('Quality policy text.')).toBeTruthy();
    // Navigation landmarks get 44px targets (ruling R11).
    for (const a of Array.from(nav.querySelectorAll('a'))) {
      expect(a.className).toContain('min-h-11');
      expect(a.className).toContain('inline-flex');
      expect(a.className).toContain('items-center');
    }
    expect(screen.getByText('Mission text.')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'The campus' })).toBeTruthy();
  });

  it('shows Vision before Mission, and goals then per-program objective lists under h3/h4 headings', () => {
    production();
    const { container } = renderUi(<AboutView about={fullAbout} />);
    const mv = container.querySelector('section#mission-and-vision') as HTMLElement;
    expect(Array.from(mv.querySelectorAll('h3')).map((h) => h.textContent)).toEqual(['Vision', 'Mission']);
    const go = container.querySelector('section#goals-and-objectives') as HTMLElement;
    expect(Array.from(go.querySelectorAll('h3, h4')).map((h) => `${h.tagName}: ${h.textContent}`)).toEqual([
      'H3: Goals',
      'H3: Program Objectives',
      'H4: Program A Objectives',
      'H4: Program B Objectives',
    ]);
    const lists = Array.from(go.querySelectorAll('ul')).map((ul) => Array.from(ul.querySelectorAll('li')).map((li) => li.textContent));
    expect(lists).toEqual([['Objective one;', 'Objective two.'], ['Objective three.']]);
  });

  it('shows each program description under its own h3, and the deans as a list after the history', () => {
    production();
    const { container } = renderUi(<AboutView about={fullAbout} />);
    const pd = container.querySelector('section#program-description') as HTMLElement;
    expect(Array.from(pd.querySelectorAll('h3')).map((h) => h.textContent)).toEqual([
      'Program A Description',
      'Program B Description',
    ]);
    expect(within(pd).getByText('Description B.').tagName).toBe('P');
    const history = container.querySelector('section#history') as HTMLElement;
    const items = Array.from(history.querySelectorAll('p, li')).map((el) => `${el.tagName}: ${el.textContent}`);
    expect(items).toEqual([
      'P: History text.',
      'P: Led by several Deans:',
      'LI: Dean One (2000 - 2001)',
      'LI: Dean Two (2001 - present)',
    ]);
    // No visible h3 in History, so the list carries the slot label as its accessible name.
    expect(within(history).getByRole('list', { name: 'Deans' })).toBeTruthy();
  });

  it('clicking the pill for the section already in the URL moves focus to its title again', async () => {
    renderUi(<AboutView about={fullAbout} />, '/about#history');
    const title = screen.getByRole('heading', { level: 2, name: 'History' });
    await waitFor(() => expect(document.activeElement).toBe(title));
    const pill = within(screen.getByRole('navigation', { name: 'On this page' })).getByRole('link', { name: 'History' });
    pill.focus();
    // The browser's own fragment navigation would reset focus, so the click must not take its default action.
    expect(fireEvent.click(pill, { ctrlKey: true })).toBe(true);
    expect(fireEvent.click(pill)).toBe(false);
    expect(document.activeElement).toBe(title);
  });

  it('section titles sit on a maroon band and the page nav is a labelled bar of button links', () => {
    production();
    renderUi(<AboutView about={fullAbout} />);
    for (const h2 of screen.getAllByRole('heading', { level: 2 })) {
      expect(h2.className).toContain('text-white');
      const band = h2.parentElement as HTMLElement;
      expect(band.className).toContain('bg-maroon-800');
      expect(band.className).toContain('on-maroon');
    }
    // Subtitles stay plain maroon text, so they read as a lower level.
    for (const h3 of screen.getAllByRole('heading', { level: 3 })) expect(h3.className).toContain('text-maroon-800');
    const nav = screen.getByRole('navigation', { name: 'On this page' });
    expect(nav.textContent).toContain('On this page');
    for (const a of Array.from(nav.querySelectorAll('a'))) {
      expect(a.className).toContain('rounded-full');
      expect(a.className).toContain('border-maroon-800');
    }
  });

  it('about with everything pending in production shows the preparing note and no headings', () => {
    production();
    const { container } = renderUi(<AboutView about={pendingAbout} />);
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
    expect(container.querySelector('section')).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'On this page' })).toBeNull();
  });

  it('about omits a pending section in production but keeps the published ones', () => {
    production();
    renderUi(<AboutView about={{ ...pendingAbout, history: fullAbout.history }} />);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['History']);
    const nav = screen.getByRole('navigation', { name: 'On this page' });
    expect(nav.querySelectorAll('a')).toHaveLength(1);
  });

  it('about shows pending notices for every section when pending content is shown', () => {
    vi.stubEnv('VITE_CONTENT_PREVIEW', 'true');
    renderUi(<AboutView about={pendingAbout} />);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(5);
    expect(screen.getByText('Pending: Quality Policy')).toBeTruthy();
    expect(screen.getByText('Pending: Program Description')).toBeTruthy();
    expect(screen.getByText('Pending: Deans')).toBeTruthy();
    expect(screen.getByText('Pending: Mission')).toBeTruthy();
    expect(screen.getByText('Pending: History')).toBeTruthy();
    expect(screen.getByText('Pending: About photograph')).toBeTruthy();
  });
});

describe('PeopleView and FacultyOfProgramsView', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('pending people are hidden in production', () => {
    production();
    renderUi(
      <PeopleView
        people={[person('a', 'Visible Vera', { role: 'official' }), person('b', 'Hidden Hal', { status: 'pending' })]}
      />,
      '/about/people',
    );
    expect(screen.getByText('Visible Vera')).toBeTruthy();
    expect(screen.queryByText('Hidden Hal')).toBeNull();
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Officials']);
  });

  it('people page with nobody visible shows the preparing note and no headings', () => {
    production();
    renderUi(<PeopleView people={[person('b', 'Hidden Hal', { status: 'pending' })]} />, '/about/people');
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
  });

  it('people page groups into labelled lists in role order', () => {
    production();
    renderUi(
      <PeopleView
        people={[
          person('s', 'Sam', { role: 'staff' }),
          person('f', 'Fay', { role: 'faculty' }),
          person('o', 'Olly', { role: 'official' }),
        ]}
      />,
      '/about/people',
    );
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Officials',
      'Faculty',
      'Staff',
    ]);
    expect(screen.getAllByRole('list')).toHaveLength(3);
  });

  it('faculty of programs lists every group as text, featuring the list whose members all have roles', () => {
    production();
    renderUi(
      <FacultyOfProgramsView
        faculty={{
          status: 'published',
          label: 'Faculty of Programs',
          value: [
            { title: 'Chairs', members: [{ name: 'Ana Cruz, PhD', role: 'MPA Chairperson' }] },
            { title: 'Faculty of One', members: [{ name: 'Zed Reyes, DPA' }, { name: 'Amy Santos, PhD' }] },
          ],
        }}
      />,
      '/about/faculty-of-programs',
    );
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Chairs', 'Faculty of One']);
    expect(screen.queryByRole('img')).toBeNull();
    const chairs = screen.getByRole('region', { name: 'Chairs' });
    expect(chairs.className).toContain('bg-maroon-800');
    expect(within(chairs).getByText('MPA Chairperson')).toBeTruthy();
    // Supplied order, not alphabetical.
    const program = screen.getByRole('region', { name: 'Faculty of One' });
    expect(within(program).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      '1Zed Reyes, DPA',
      '2Amy Santos, PhD',
    ]);
  });

  it('faculty of programs while pending shows the preparing note', () => {
    production();
    renderUi(
      <FacultyOfProgramsView faculty={{ status: 'pending', label: 'Faculty of Programs' }} />,
      '/about/faculty-of-programs',
    );
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
  });
});

describe('PeopleView layout', () => {
  it('shows the officials featured, one per row, and everyone else three to a row, in the given order', () => {
    const list = [
      person('p', 'President', { role: 'official', photo }),
      person('d', 'Dean', { role: 'official', photo }),
      person('f1', 'Zed Faculty'),
      person('f2', 'Amy Faculty'),
      person('s1', 'Staff One', { role: 'staff' }),
      person('a1', 'Assistant One', { role: 'student-assistant' }),
    ];
    renderUi(<PeopleView people={list} />, '/about/people');
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['Officials', 'Faculty', 'Staff', 'Student Assistants']);
    const [officials, faculty] = screen.getAllByRole('list');
    expect(officials?.className).not.toContain('grid-cols-2');
    expect((within(officials as HTMLElement).getAllByRole('listitem')[0]?.firstElementChild as HTMLElement).className).toContain(
      'sm:flex-row',
    );
    expect(faculty?.className).toContain('md:grid-cols-3');
    // Order within a group is the content's order, not alphabetical.
    expect(within(faculty as HTMLElement).getAllByText(/Faculty$/).map((p) => p.textContent)).toEqual([
      'Zed Faculty',
      'Amy Faculty',
    ]);
    // Featured portraits are larger than the grid ones; no card box around any of them.
    const imgs = within(officials as HTMLElement).getAllByRole('img');
    expect(imgs[0]?.className).toContain('size-56');
    for (const li of within(faculty as HTMLElement).getAllByRole('listitem'))
      expect((li.firstElementChild as HTMLElement).className).not.toMatch(/border|bg-/);
  });

  it('keeps a "\n" in a position as a line break', () => {
    render(<PersonCard person={person('x', 'Ana Cruz', { position: 'Associate Professor III\nDean, CBPA' })} />);
    const position = screen.getByText(/Associate Professor III/);
    expect(position.textContent).toBe('Associate Professor III\nDean, CBPA');
    expect(position.className).toContain('whitespace-pre-line');
  });
});
