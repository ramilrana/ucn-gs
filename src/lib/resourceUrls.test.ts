import { describe, expect, it } from 'vitest';
import { FRAME_HOSTS } from '../../config/csp.mjs';
import type { ResourceSource } from '../types/content';
import {
  downloadUrl, embedUrl, hostLabel, isDriveId, isYouTubeId, localFileUrl,
  mapEmbedUrl, mapLinkUrl, viewUrl, youtubePosterUrl,
} from './resourceUrls';

const DRIVE_ID = '1AbCdEfGhIjKlMnOpQrStUvWxYz';
const drive: ResourceSource = { kind: 'drive', fileId: DRIVE_ID };
const youtube: ResourceSource = { kind: 'youtube', videoId: 'dQw4w9WgXcQ' };
const local: ResourceSource = { kind: 'local', path: '/files/a.pdf' };
const folder: ResourceSource = { kind: 'drive-folder', folderId: DRIVE_ID };
const external: ResourceSource = { kind: 'external', url: 'https://example.org/page' };

describe('resourceUrls', () => {
  it('every embed URL uses an allowed frame host', () => {
    for (const s of [drive, youtube, local]) {
      const url = embedUrl(s);
      expect(url).not.toBeNull();
      if (url?.startsWith('/')) continue;
      expect(FRAME_HOSTS).toContain(new URL(url ?? '', 'https://x').hostname);
    }
  });

  it('builds the expected embed URLs', () => {
    expect(embedUrl(drive)).toBe(`https://drive.google.com/file/d/${DRIVE_ID}/preview`);
    expect(embedUrl(youtube)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('rejects malformed IDs', () => {
    expect(embedUrl({ kind: 'drive', fileId: '../../x' })).toBeNull();
    expect(embedUrl({ kind: 'youtube', videoId: 'abc' })).toBeNull();
    expect(viewUrl({ kind: 'drive', fileId: '../../x' })).toBeNull();
    expect(viewUrl({ kind: 'drive-folder', folderId: 'a/b' })).toBeNull();
    expect(viewUrl({ kind: 'youtube', videoId: 'abc' })).toBeNull();
    expect(downloadUrl({ kind: 'drive', fileId: 'x&y' })).toBeNull();
  });

  it('validates ID shapes', () => {
    expect(isDriveId(DRIVE_ID)).toBe(true);
    expect(isDriveId('short')).toBe(false);
    expect(isYouTubeId('dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeId('dQw4w9WgXcQ1')).toBe(false);
  });

  it('never embeds external or folder sources', () => {
    expect(embedUrl(external)).toBeNull();
    expect(embedUrl(folder)).toBeNull();
  });

  it('localFileUrl respects base /gs/', () => {
    expect(localFileUrl('/files/a.pdf', '/gs/')).toBe('/gs/files/a.pdf');
    expect(localFileUrl('/files/a.pdf', '/')).toBe('/files/a.pdf');
    expect(localFileUrl('/files/a.pdf', '/gs')).toBe('/gs/files/a.pdf');
  });

  it('builds view URLs', () => {
    expect(viewUrl(drive)).toBe(`https://drive.google.com/file/d/${DRIVE_ID}/view`);
    expect(viewUrl(folder)).toBe(`https://drive.google.com/drive/folders/${DRIVE_ID}`);
    expect(viewUrl(youtube)).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(viewUrl(local)).toBe(localFileUrl('/files/a.pdf'));
    expect(viewUrl(external)).toBe('https://example.org/page');
  });

  it('viewUrl of an external javascript: URL is null', () => {
    expect(viewUrl({ kind: 'external', url: 'javascript:alert(1)' })).toBeNull();
  });

  it('builds download URLs', () => {
    expect(downloadUrl(local)).toBe(localFileUrl('/files/a.pdf'));
    expect(downloadUrl(drive)).toBe(`https://drive.google.com/uc?export=download&id=${DRIVE_ID}`);
    expect(downloadUrl(folder)).toBeNull();
    expect(downloadUrl(youtube)).toBeNull();
    expect(downloadUrl(external)).toBeNull();
  });

  it('builds the YouTube poster URL', () => {
    expect(youtubePosterUrl('dQw4w9WgXcQ')).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });

  it('mapEmbedUrl encodes the query', () => {
    expect(mapEmbedUrl('A & B')).toContain('q=A%20%26%20B&output=embed');
    expect(mapEmbedUrl('A & B')).toMatch(/^https:\/\/www\.google\.com\/maps\?/);
  });

  it('mapLinkUrl encodes the query', () => {
    expect(mapLinkUrl('A & B')).toBe('https://www.google.com/maps/search/?api=1&query=A%20%26%20B');
  });

  it('hostLabel names the host', () => {
    expect(hostLabel(local)).toBe('This site');
    expect(hostLabel(drive)).toBe('Google Drive');
    expect(hostLabel(folder)).toBe('Google Drive');
    expect(hostLabel(youtube)).toBe('YouTube');
    expect(hostLabel(external)).toBe('example.org');
    expect(hostLabel({ kind: 'external', url: 'not a url' })).toBe('External site');
  });
});
