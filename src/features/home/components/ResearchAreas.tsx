import { Col, Row, Typography } from 'antd';
import { site } from '../../../data/site';

export function ResearchAreas() {
  return (
    <Row gutter={[32, 32]}>
      {site.researchAreas.map((area) => (
        <Col key={area.title} xs={24} sm={12} lg={6}>
          <div className="area">
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {area.title}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
              {area.description}
            </Typography.Paragraph>
          </div>
        </Col>
      ))}
    </Row>
  );
}
