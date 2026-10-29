import { useState } from 'react';
import { Alert, Card, Flex, Tag, Typography } from 'antd';
import type { VideoItem } from '../../../types/media';
import { safeHref as safeUrl } from '../../../lib/safeUrl';
import { colors } from '../../../styles/tokens';
import { CATEGORY_LABELS } from '../categories';

export function VideoCard({ item }: { item: VideoItem }) {
  const [failed, setFailed] = useState(false);

  const src = safeUrl(item.src);
  const poster = safeUrl(item.poster) ?? undefined;
  const captions = item.captions ? safeUrl(item.captions) : null;

  const body = (
    <Flex vertical align="flex-start" gap={8}>
      <Tag bordered={false} color={colors.primary}>
        {CATEGORY_LABELS[item.category]}
      </Tag>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {item.title}
      </Typography.Title>
      {item.description && (
        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
          {item.description}
        </Typography.Paragraph>
      )}
    </Flex>
  );

  if (!src || failed) {
    return (
      <Card>
        <Alert
          type="error"
          showIcon
          message="This video could not be loaded."
          style={{ marginBottom: 16 }}
        />
        {body}
      </Card>
    );
  }

  const mimeType = src.endsWith('.webm') ? 'video/webm' : 'video/mp4';

  return (
    <Card
      cover={
        <video
          controls
          playsInline
          preload="metadata"
          poster={poster}
          style={{ width: '100%', aspectRatio: '16 / 9', background: '#000' }}
        >
          <source src={src} type={mimeType} onError={() => setFailed(true)} />
          {captions && <track kind="captions" src={captions} srcLang="en" label="English" />}
          Your browser does not support video playback.
        </video>
      }
    >
      {body}
    </Card>
  );
}
