import { Link } from 'react-router-dom';
import { Breadcrumb, Typography } from 'antd';

interface PageBannerProps {
  title: string;
  description?: string;
}

export function PageBanner({ title, description }: PageBannerProps) {
  return (
    <div className="banner">
      <div className="page-container">
        <Breadcrumb items={[{ title: <Link to="/">Home</Link> }, { title }]} />
        <Typography.Title level={1} className="banner__title">
          {title}
        </Typography.Title>
        {description && (
          <Typography.Paragraph type="secondary" className="banner__text">
            {description}
          </Typography.Paragraph>
        )}
      </div>
    </div>
  );
}
