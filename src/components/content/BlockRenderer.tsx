import type { EvidenceBlock } from '../../types/content';
import { DocumentViewer } from '../media/DocumentViewer';
import { ImageGallery } from '../media/ImageGallery';
import { VideoEmbed } from '../media/VideoEmbed';
import { Prose } from './Prose';
import { ResourceList } from './ResourceList';

interface BlockRendererProps {
  block: EvidenceBlock;
  /** Accessible name for a gallery block, which has none of its own. */
  label?: string;
}

export function BlockRenderer({ block, label }: BlockRendererProps) {
  switch (block.type) {
    case 'text':
      return <Prose paragraphs={block.paragraphs} lang={block.lang} />;
    case 'document':
      return <DocumentViewer resource={block.resource} mode={block.embed ? 'embedded' : 'on-demand'} />;
    case 'resources':
      return <ResourceList items={block.items} />;
    case 'gallery':
      return <ImageGallery label={label ?? 'Photo gallery'} images={block.images} />;
    case 'video':
      return <VideoEmbed resource={block.resource} />;
    default: {
      const unhandled: never = block;
      return unhandled;
    }
  }
}
