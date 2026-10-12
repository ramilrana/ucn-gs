import { useNavigate } from 'react-router-dom';
import { Button, Col, Row, Typography } from 'antd';
import { OnDark } from './OnDark';

export function ContactBand() {
  const navigate = useNavigate();

  return (
    <section className="contact-band">
      <div className="page-container">
        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} md={16}>
            <Typography.Title level={2} className="contact-band__title">
              Work with the Research Office
            </Typography.Title>
            <Typography.Paragraph className="contact-band__text">
              Looking for funding guidance, partnerships or research support? Get in touch with our
              team.
            </Typography.Paragraph>
          </Col>
          <Col xs={24} md={8}>
            <OnDark>
              <Button type="primary" size="large" onClick={() => void navigate('/about')}>
                Contact the office
              </Button>
            </OnDark>
          </Col>
        </Row>
      </div>
    </section>
  );
}
