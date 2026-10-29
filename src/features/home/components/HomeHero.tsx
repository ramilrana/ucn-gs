import { useNavigate } from 'react-router-dom';
import { Button, Col, Flex, Image, Row, Typography } from 'antd';
import { OnDark } from '../../../components/OnDark';
import { site } from '../../../data/site';
import type { ImageItem } from '../../../types/media';
import { FALLBACK_IMAGE } from '../../../utils/fallbackImage';
import { safeHref as safeUrl } from '../../../lib/safeUrl';
import { CATEGORY_LABELS } from '../../gallery/categories';

export function HomeHero({ image }: { image?: ImageItem }) {
  const navigate = useNavigate();
  const src = image ? safeUrl(image.src) : null;

  return (
    <section className="hero">
      <div className="page-container">
        <Row gutter={[48, 40]} align="middle">
          <Col xs={24} lg={13}>
            <Typography.Title level={1} className="hero__title">
              {site.heroTitle}
            </Typography.Title>
            <Typography.Paragraph className="hero__text">{site.heroText}</Typography.Paragraph>
            <OnDark>
              <Flex gap={12} wrap>
                <Button type="primary" size="large" onClick={() => void navigate('/gallery')}>
                  Explore our work
                </Button>
                <Button ghost size="large" onClick={() => void navigate('/videos')}>
                  Watch videos
                </Button>
              </Flex>
            </OnDark>
          </Col>
          {image && src && (
            <Col xs={24} lg={11}>
              <figure className="hero__figure">
                <Image
                  src={src}
                  alt={image.alt}
                  width="100%"
                  loading="lazy"
                  preview={false}
                  fallback={FALLBACK_IMAGE}
                  style={{ aspectRatio: `${image.width} / ${image.height}`, objectFit: 'cover' }}
                />
                <figcaption>
                  {image.title} ({CATEGORY_LABELS[image.category]})
                </figcaption>
              </figure>
            </Col>
          )}
        </Row>
      </div>
    </section>
  );
}
