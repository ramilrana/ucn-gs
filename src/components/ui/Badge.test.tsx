import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import type { ResourceFormat } from '../../types/content';
import { Badge } from './Badge';

const labels: Record<ResourceFormat, string> = {
  pdf: 'PDF', video: 'Video', folder: 'Folder', doc: 'Doc', link: 'Link', image: 'Image',
};

it.each(Object.entries(labels))('%s badge shows text %s', (format, text) => {
  render(<Badge format={format as ResourceFormat} />);
  expect(screen.getByText(text)).not.toBeNull();
});
