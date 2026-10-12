import { Card, Flex, Image, Skeleton, Tag, Typography } from 'antd';
import type { ImageItem } from '../../../types/media';
import { FALLBACK_IMAGE } from '../../../utils/fallbackImage';
import { safeUrl } from '../../../utils/safeUrl';
import { colors } from '../../../styles/tokens';
import { CATEGORY_LABELS } from '../categories';

export function ImageCard({ item }: { item: ImageItem }) {
  const src = safeUrl(item.src);
  if (!src) return null;
  const thumb = (item.thumbnail ? safeUrl(item.thumbnail) : null) ?? src;

  return (
    <Card
      className="media-card"
      hoverable
      cover={
        <Image
          src={thumb}
          alt={item.alt}
          width="100%"
          loading="lazy"
          rootClassName="media-card__image"
          fallback={FALLBACK_IMAGE}
          placeholder={<Skeleton.Image active style={{ width: '100%', height: '100%' }} />}
          preview={{ src }}
          style={{ aspectRatio: `${item.width} / ${item.height}`, objectFit: 'cover' }}
        />
      }
    >
      <Flex vertical align="flex-start" gap={8}>
        <Tag bordered={false} color={colors.primary}>
          {CATEGORY_LABELS[item.category]}
        </Tag>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {item.title}
        </Typography.Title>
        {item.description && (
          <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
            {item.description}
          </Typography.Paragraph>
        )}
      </Flex>
    </Card>
  );
}
