import { Col, Empty, Image, Row } from 'antd';
import type { ImageItem } from '../../../types/media';
import { ImageCard } from './ImageCard';

interface ImageGridProps {
  items: readonly ImageItem[];
}

export function ImageGrid({ items }: ImageGridProps) {
  if (items.length === 0) return <Empty description="No images in this category yet" />;

  return (
    <Image.PreviewGroup>
      <Row gutter={[24, 24]}>
        {items.map((item) => (
          <Col key={item.id} xs={24} sm={12} lg={8}>
            <ImageCard item={item} />
          </Col>
        ))}
      </Row>
    </Image.PreviewGroup>
  );
}
