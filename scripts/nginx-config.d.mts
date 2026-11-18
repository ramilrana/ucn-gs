export function renderNginxFiles(options: {
  template: string;
  base: string;
  docroot?: string;
  includeDir?: string;
  headers?: Record<string, string>;
}): { 'ucn-gs.conf': string; 'security-headers.conf': string; 'pdf-headers.conf': string };
export function validateDirOption(name: string, value: string): string;
