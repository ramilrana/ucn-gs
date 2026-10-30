import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ImageAsset, Resource } from '../../types/content';
import { VideoEmbed } from './VideoEmbed';

const YT = 'dQw4w9WgXcQ';
const FILE_ID = '1AbCdEfGhIjKlMnOpQrStUvWx';

const video = (source: Resource['source'], extra: Partial<Resource> = {}): Resource =>
  ({ id: 'v1', title: 'Campus Tour', format: 'video', status: 'published', source, ...extra }) as Resource;

const renderVideo = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('VideoEmbed', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('no iframe before play; youtube-nocookie iframe after', async () => {
    const user = userEvent.setup();
    const { container } = renderVideo(<VideoEmbed resource={video({ kind: 'youtube', videoId: YT })} />);
    expect(container.querySelector('iframe')).toBeNull();
    const play = screen.getByRole('button', { name: 'Play video: Campus Tour' });
    expect(play.className).toContain('min-h-11');
    expect(play.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(play.querySelector('img')?.getAttribute('src')).toBe(`https://i.ytimg.com/vi/${YT}/hqdefault.jpg`);
    expect(play.className).toContain('aspect-video');

    await user.click(play);
    const frame = screen.getByTitle('Campus Tour');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toBe(`https://www.youtube-nocookie.com/embed/${YT}?autoplay=1`);
    expect(frame.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin allow-popups allow-presentation');
    expect(frame.getAttribute('allow')).toBe('fullscreen; encrypted-media; picture-in-picture; autoplay');
    expect(frame.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin');
    expect(document.activeElement).toBe(frame);
    expect(screen.queryByRole('button', { name: /Play video/ })).toBeNull();
    const open = screen.getByRole('link', { name: /Open video in new tab/ });
    expect(open.getAttribute('href')).toBe(`https://www.youtube.com/watch?v=${YT}`);
    expect(open.getAttribute('target')).toBe('_blank');
  });

  it('drive video without poster shows a plain maroon panel and no autoplay param', async () => {
    const user = userEvent.setup();
    renderVideo(<VideoEmbed resource={video({ kind: 'drive', fileId: FILE_ID })} />);
    const play = screen.getByRole('button', { name: 'Play video: Campus Tour' });
    expect(play.querySelector('img')).toBeNull();
    expect(play.className).toContain('bg-maroon-800');
    await user.click(play);
    expect(screen.getByTitle('Campus Tour').getAttribute('src')).toBe(
      `https://drive.google.com/file/d/${FILE_ID}/preview`,
    );
  });

  it('supplied poster wins over the youtube poster', () => {
    const poster: ImageAsset = { src: '/img/poster.jpg', width: 1280, height: 720, alt: '' };
    renderVideo(<VideoEmbed resource={video({ kind: 'youtube', videoId: YT })} poster={poster} />);
    const img = screen.getByRole('button', { name: /Play video/ }).querySelector('img');
    expect(img?.getAttribute('src')).toBe('/img/poster.jpg');
  });

  it('invalid youtube id never builds a poster URL or a frame', () => {
    const { container } = renderVideo(<VideoEmbed resource={video({ kind: 'youtube', videoId: 'x"><script' })} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.innerHTML).not.toContain('ytimg');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('invalid drive id renders the title as plain text with no link and no frame', () => {
    const { container } = renderVideo(<VideoEmbed resource={video({ kind: 'drive', fileId: 'short' })} />);
    expect(container.textContent).toBe('Campus Tour');
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('invalid youtube id also keeps the title as plain text', () => {
    const { container } = renderVideo(<VideoEmbed resource={video({ kind: 'youtube', videoId: 'bad' })} />);
    expect(container.textContent).toBe('Campus Tour');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('unsafe external url renders the title as plain text with no link and no frame', () => {
    const { container } = renderVideo(
      <VideoEmbed resource={video({ kind: 'external', url: 'javascript:alert(1)' })} />,
    );
    expect(container.textContent).toBe('Campus Tour');
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('facebook external renders a link, never an iframe', () => {
    const { container } = renderVideo(
      <VideoEmbed resource={video({ kind: 'external', url: 'https://www.facebook.com/watch/?v=123' })} />,
    );
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    const link = screen.getByRole('link', { name: /Watch on www\.facebook\.com/ });
    expect(link.getAttribute('href')).toBe('https://www.facebook.com/watch/?v=123');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('local video renders no frame and no play button, only the title and an Open link', () => {
    const { container } = renderVideo(<VideoEmbed resource={video({ kind: 'local', path: '/files/tour.mp4' })} />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    const title = container.querySelector('span.font-semibold');
    expect(title?.textContent).toBe('Campus Tour');
    expect(container.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
    const open = screen.getByRole('link', { name: /Open video in new tab/ });
    expect(open.getAttribute('href')).toBe('/files/tour.mp4');
    expect(open.getAttribute('target')).toBe('_blank');
  });

  it('link names carry the resource title, so several videos in one container stay distinguishable', () => {
    const a = video({ kind: 'local', path: '/files/a.mp4' }, { id: 'va', title: 'Alpha Video' });
    const b = video({ kind: 'drive', fileId: FILE_ID }, { id: 'vb', title: 'Beta Video' });
    const c = video({ kind: 'external', url: 'https://www.facebook.com/watch/?v=123' }, { id: 'vc', title: 'Gamma Video' });
    renderVideo(
      <div>
        <VideoEmbed resource={a} />
        <VideoEmbed resource={b} />
        <VideoEmbed resource={c} />
      </div>,
    );
    // Label in name: the visible text comes first, the title follows (jsdom drops the sr-only span's leading space).
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(screen.getByRole('link', { name: /^Open video in new tab\s*Alpha Video/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /^Open video in new tab\s*Beta Video/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /^Watch on www\.facebook\.com\s*Gamma Video/ })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /^Open video in new tab/ })).toHaveLength(2);
  });

  it('pending video without source shows PendingNotice in dev, nothing in prod', () => {
    const pending = { id: 'p', title: 'Future Video', format: 'video', status: 'pending' } as Resource;
    vi.stubEnv('DEV', true);
    const dev = renderVideo(<VideoEmbed resource={pending} />);
    expect(screen.getByRole('note').textContent).toBe('Pending: Future Video');
    dev.unmount();
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_CONTENT_PREVIEW', '');
    const prod = renderVideo(<VideoEmbed resource={pending} />);
    expect(prod.container.innerHTML).toBe('');
  });
});
