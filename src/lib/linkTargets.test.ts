// @vitest-environment node
import { describe, expect, it } from 'vitest';
import * as content from '../content/index';
import type { Resource } from '../types/content';
import { classifyResponse, collectLinkTargets, formatLinkReport } from './linkTargets';

const DRIVE_ID = '1AbCdEfGhIjKlMnOpQrStUvWx';
const FOLDER_ID = '1ZyXwVuTsRqPoNmLkJiHgFeDc';

const res = (id: string, over: Record<string, unknown> = {}): Resource =>
  ({ id, title: `Title ${id}`, format: 'pdf', status: 'published', ...over }) as Resource;

describe('classifyResponse', () => {
  it('200 to 299 is ok', () => {
    expect(classifyResponse(200, null)).toBe('ok');
    expect(classifyResponse(204, null)).toBe('ok');
    expect(classifyResponse(299, null)).toBe('ok');
  });

  it('302 to accounts.google.com is not-public', () => {
    expect(classifyResponse(302, 'https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fdrive.google.com')).toBe('not-public');
    expect(classifyResponse(303, 'https://ACCOUNTS.GOOGLE.COM/v3/signin')).toBe('not-public');
  });

  it('a redirect to a ServiceLogin path on any host is not-public', () => {
    expect(classifyResponse(302, 'https://drive.google.com/ServiceLogin?x=1')).toBe('not-public');
    expect(classifyResponse(307, '/accounts/servicelogin')).toBe('not-public');
  });

  it('301 elsewhere is redirect', () => {
    expect(classifyResponse(301, 'https://example.org/new-place')).toBe('redirect');
    expect(classifyResponse(302, '/relative/path')).toBe('redirect');
    expect(classifyResponse(308, null)).toBe('redirect');
  });

  it('a look-alike host is not treated as the Google sign-in page', () => {
    expect(classifyResponse(302, 'https://accounts.google.com.evil.example/x')).toBe('redirect');
  });

  it('404 is broken', () => {
    expect(classifyResponse(404, null)).toBe('broken');
  });

  it('other failures are broken', () => {
    expect(classifyResponse(403, null)).toBe('broken');
    expect(classifyResponse(500, null)).toBe('broken');
    expect(classifyResponse(0, null)).toBe('broken');
    expect(classifyResponse(199, null)).toBe('broken');
    expect(classifyResponse(400, 'https://accounts.google.com/ServiceLogin')).toBe('broken');
  });
});

describe('collectLinkTargets', () => {
  const fixture = {
    areas: [
      {
        slug: 'a', status: 'published',
        narrativeReport: res('r-drive', { source: { kind: 'drive', fileId: DRIVE_ID } }),
        groups: [
          {
            id: 'g1', status: 'published',
            blocks: [
              { type: 'document', resource: res('r-folder', { format: 'folder', source: { kind: 'drive-folder', folderId: FOLDER_ID } }) },
              { type: 'video', resource: res('r-yt', { format: 'video', source: { kind: 'youtube', videoId: 'dQw4w9WgXcQ' } }) },
              { type: 'resources', items: [res('r-ext', { format: 'link', source: { kind: 'external', url: 'https://example.org/page' } })] },
            ],
          },
          {
            id: 'g-pending', status: 'pending',
            blocks: [{ type: 'document', resource: res('r-in-pending-group', { source: { kind: 'drive', fileId: DRIVE_ID.replace('1', '2') } }) }],
          },
        ],
      },
      {
        slug: 'pending-area', status: 'pending',
        narrativeReport: res('r-in-pending-area', { source: { kind: 'external', url: 'https://example.org/pending-area' } }),
      },
    ],
    other: [
      res('r-local', { source: { kind: 'local', path: '/files/a.pdf' } }),
      res('r-pending', { status: 'pending', source: { kind: 'external', url: 'https://example.org/pending' } }),
      res('r-no-source'),
      res('r-bad-drive', { source: { kind: 'drive', fileId: 'short' } }),
      res('r-bad-external', { source: { kind: 'external', url: 'javascript:alert(1)' } }),
      res('DEV-SAMPLE-drive', { source: { kind: 'drive', fileId: 'DEVSAMPLEdriveFileId000000' } }),
    ],
  };

  const targets = collectLinkTargets(fixture);
  const byWhere = (id: string) => targets.find((t) => t.where.includes(`"${id}"`));

  it('collects drive, drive-folder, youtube and external sources with viewUrl', () => {
    expect(byWhere('r-drive')).toMatchObject({ kind: 'drive', url: `https://drive.google.com/file/d/${DRIVE_ID}/view` });
    expect(byWhere('r-folder')).toMatchObject({ kind: 'drive-folder', url: `https://drive.google.com/drive/folders/${FOLDER_ID}` });
    expect(byWhere('r-yt')).toMatchObject({ kind: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
    expect(byWhere('r-ext')).toMatchObject({ kind: 'external', url: 'https://example.org/page' });
    expect(targets).toHaveLength(4);
  });

  it('pending resources are not collected', () => {
    expect(byWhere('r-pending')).toBeUndefined();
  });

  it('nothing under a pending group or a pending area is collected', () => {
    expect(byWhere('r-in-pending-group')).toBeUndefined();
    expect(byWhere('r-in-pending-area')).toBeUndefined();
  });

  it('local files, missing sources, invalid sources and DEV-SAMPLE ids are skipped', () => {
    for (const id of ['r-local', 'r-no-source', 'r-bad-drive', 'r-bad-external', 'DEV-SAMPLE-drive']) {
      expect(byWhere(id), id).toBeUndefined();
    }
  });

  it('names the resource in where', () => {
    expect(byWhere('r-drive')?.where).toBe('resource "r-drive" (Title r-drive)');
  });

  it('reports a shared resource once', () => {
    const shared = res('shared', { source: { kind: 'external', url: 'https://example.org/shared' } });
    expect(collectLinkTargets({ a: shared, b: [shared], c: { again: shared } })).toHaveLength(1);
  });

  it('real content yields only https targets and never a sample', () => {
    for (const target of collectLinkTargets(content)) {
      expect(target.url.startsWith('https://'), target.url).toBe(true);
      expect(target.where).not.toContain('DEV-SAMPLE-');
    }
  });
});

describe('formatLinkReport', () => {
  it('lists each failing target with its status and place', () => {
    const text = formatLinkReport([
      { url: 'https://drive.google.com/file/d/x/view', where: 'resource "a" (A)', kind: 'drive', result: 'not-public', status: 302 },
      { url: 'https://example.org/gone', where: 'resource "b" (B)', kind: 'external', result: 'broken', status: 404 },
    ]);
    expect(text).toContain('not-public');
    expect(text).toContain('broken');
    expect(text).toContain('404');
    expect(text).toContain('resource "b" (B)');
    expect(text).toContain('https://example.org/gone');
  });
});
