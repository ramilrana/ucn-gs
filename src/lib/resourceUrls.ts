import type { Resource, ResourceSource } from '../types/content';
import { safeHref } from './safeUrl';

const DRIVE_ID = /^[A-Za-z0-9_-]{20,}$/;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function isDriveId(id: string): boolean {
  return DRIVE_ID.test(id);
}

export function isYouTubeId(id: string): boolean {
  return YOUTUBE_ID.test(id);
}

/** Joins the site base path and a root-relative path with exactly one slash. */
export function localFileUrl(path: string, base: string = import.meta.env.BASE_URL): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/** True for a local PDF that opted in to inline display: local source, format pdf, path ends in .pdf. */
export function isInlinePdf(resource: Resource): boolean {
  const source = resource.source;
  return (
    resource.inline === true &&
    resource.format === 'pdf' &&
    source?.kind === 'local' &&
    source.path.toLowerCase().endsWith('.pdf')
  );
}

/**
 * Iframe URL for a resource, or null when it cannot be embedded. Drive and YouTube URLs are built only from
 * validated IDs on an allowed https frame host. A local file is framed (same-origin) only when it is an
 * opted-in PDF; every other local file stays an Open / Download card.
 */
export function embedUrl(resource: Resource): string | null {
  const source = resource.source;
  if (!source) return null;
  switch (source.kind) {
    case 'drive':
      return isDriveId(source.fileId) ? `https://drive.google.com/file/d/${source.fileId}/preview` : null;
    case 'youtube':
      return isYouTubeId(source.videoId) ? `https://www.youtube-nocookie.com/embed/${source.videoId}` : null;
    case 'local':
      return isInlinePdf(resource) ? localFileUrl(source.path) : null;
    case 'drive-folder':
    case 'external':
      return null;
  }
}

/** Link target for "open in new tab", or null when the source has no safe URL. */
export function viewUrl(source: ResourceSource): string | null {
  switch (source.kind) {
    case 'drive':
      return isDriveId(source.fileId) ? `https://drive.google.com/file/d/${source.fileId}/view` : null;
    case 'drive-folder':
      return isDriveId(source.folderId) ? `https://drive.google.com/drive/folders/${source.folderId}` : null;
    case 'youtube':
      return isYouTubeId(source.videoId) ? `https://www.youtube.com/watch?v=${source.videoId}` : null;
    case 'local':
      return localFileUrl(source.path);
    case 'external':
      return safeHref(source.url);
  }
}

export function downloadUrl(source: ResourceSource): string | null {
  switch (source.kind) {
    case 'local':
      return localFileUrl(source.path);
    case 'drive':
      return isDriveId(source.fileId) ? `https://drive.google.com/uc?export=download&id=${source.fileId}` : null;
    default:
      return null;
  }
}

export function youtubePosterUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function mapEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function mapLinkUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function hostLabel(source: ResourceSource): 'This site' | 'Google Drive' | 'YouTube' | string {
  switch (source.kind) {
    case 'local':
      return 'This site';
    case 'drive':
    case 'drive-folder':
      return 'Google Drive';
    case 'youtube':
      return 'YouTube';
    case 'external':
      try {
        return new URL(source.url).hostname;
      } catch {
        return 'External site';
      }
  }
}
