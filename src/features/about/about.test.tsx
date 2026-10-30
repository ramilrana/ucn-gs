import { act, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RootLayout } from '../../app/RootLayout';
import type { AboutContent, ImageAsset, Person } from '../../types/content';
import { AboutView } from './AboutView';
import { FacultyByDepartmentView } from './FacultyByDepartmentView';
import { PeopleView } from './PeopleView';
import { PersonCard } from './PersonCard';
import { groupByDepartment, groupByRole } from './groupPeople';

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
  mission: { status: 'pending', label: 'Mission' },
  vision: { status: 'pending', label: 'Vision' },
  goals: { status: 'pending', label: 'Goals' },
  objectives: { status: 'pending', label: 'Objectives' },
  history: { status: 'pending', label: 'History' },
};

const fullAbout: AboutContent = {
  photo: {
    status: 'published',
    label: 'About photograph',
    value: { src: '/assets/about.jpg', width: 800, height: 500, alt: 'The campus' },
  },
  mission: { status: 'published', label: 'Mission', value: ['Mission text.'] },
  vision: { status: 'published', label: 'Vision', value: ['Vision text.'] },
  goals: { status: 'published', label: 'Goals', value: ['Goal one.', 'Goal two.'] },
  objectives: { status: 'published', label: 'Objectives', value: ['Objective one.'] },
  history: { status: 'published', label: 'History', value: ['History text.'] },
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

describe('groupByDepartment', () => {
  it('groupByDepartment sorts and files unassigned faculty last', () => {
    const groups = groupByDepartment([
      person('a', 'Zoe', { department: 'Education' }),
      person('b', 'Ann'),
      person('c', 'Bob', { department: 'Education' }),
      person('d', 'Cal', { department: 'Business' }),
      person('e', 'Staffer', { role: 'staff', department: 'Aardvark Studies' }),
      person('f', 'Dee', { department: '  ' }),
    ]);
    expect(groups.map((g) => g.department)).toEqual(['Business', 'Education', 'Department not specified']);
    expect(groups[1]?.people.map((p) => p.name)).toEqual(['Bob', 'Zoe']);
    expect(groups[2]?.people.map((p) => p.name)).toEqual(['Ann', 'Dee']);
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

  it('about sections have stable anchors', () => {
    production();
    const { container } = renderUi(<AboutView about={fullAbout} />);
    for (const id of ['mission-and-vision', 'goals-and-objectives', 'history']) {
      const section = container.querySelector(`section#${id}`);
      expect(section, id).not.toBeNull();
      expect(section?.querySelector('h2')).not.toBeNull();
    }
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Mission and Vision',
      'Goals and Objectives',
      'History',
    ]);
    const nav = screen.getByRole('navigation', { name: 'On this page' });
    const hrefs = Array.from(nav.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['#mission-and-vision', '#goals-and-objectives', '#history']);
    // Navigation landmarks get 44px targets (ruling R11).
    for (const a of Array.from(nav.querySelectorAll('a'))) {
      expect(a.className).toContain('min-h-11');
      expect(a.className).toContain('inline-flex');
      expect(a.className).toContain('items-center');
    }
    expect(screen.getByText('Mission text.')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'The campus' })).toBeTruthy();
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
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
    expect(screen.getByText('Pending: Mission')).toBeTruthy();
    expect(screen.getByText('Pending: History')).toBeTruthy();
    expect(screen.getByText('Pending: About photograph')).toBeTruthy();
  });
});

describe('PeopleView and FacultyByDepartmentView', () => {
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

  it('faculty by department lists faculty only, grouped by department', () => {
    production();
    renderUi(
      <FacultyByDepartmentView
        people={[
          person('a', 'Zoe', { department: 'Education' }),
          person('b', 'Staffer', { role: 'staff', department: 'Education' }),
          person('c', 'Hidden', { department: 'Law', status: 'pending' }),
          person('d', 'Nodept'),
        ]}
      />,
      '/about/faculty-by-department',
    );
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Education',
      'Department not specified',
    ]);
    expect(screen.queryByText('Staffer')).toBeNull();
    expect(screen.queryByText('Hidden')).toBeNull();
  });

  it('faculty by department with no faculty shows the preparing note', () => {
    production();
    renderUi(
      <FacultyByDepartmentView people={[person('b', 'Staffer', { role: 'staff' })]} />,
      '/about/faculty-by-department',
    );
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
  });
});
