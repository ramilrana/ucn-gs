import { Link } from 'react-router-dom';
import { Flex, Typography } from 'antd';

interface SectionHeadingProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}

export function SectionHeading({ title, description, actionLabel, actionTo }: SectionHeadingProps) {
  return (
    <Flex justify="space-between" align="flex-end" wrap gap={16} style={{ marginBottom: 32 }}>
      <div style={{ maxWidth: 640 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {description && (
          <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
            {description}
          </Typography.Paragraph>
        )}
      </div>
      {actionLabel && actionTo && (
        <Link to={actionTo}>
          <strong>{actionLabel}</strong>
        </Link>
      )}
    </Flex>
  );
}
