import { Col, Empty, Row } from 'antd';
import { PageBanner } from '../components/PageBanner';
import { videoItems } from '../data/media';
import { VideoCard } from '../features/gallery/components/VideoCard';

export default function VideosPage() {
  return (
    <>
      <PageBanner
        title="Videos"
        description="Watch recordings from our events, facilities and research teams."
      />
      <div className="page-container page-body">
        {videoItems.length === 0 ? (
          <Empty description="No videos yet" />
        ) : (
          <Row gutter={[24, 24]}>
            {videoItems.map((item) => (
              <Col key={item.id} xs={24} md={12}>
                <VideoCard item={item} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </>
  );
}
