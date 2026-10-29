import { CompassOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Button, Card, Col, Image, List, Row, Space, Typography } from "antd";
import { campusMap } from "../../../data/media";
import { site } from "../../../data/site";
import { safeHref as safeUrl } from '../../../lib/safeUrl';

export function LocationSection() {
  const mapSrc = safeUrl(campusMap.src);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${site.universityName}, ${site.contact.address}`,
  )}`;

  return (
    <Row gutter={[32, 24]} align="stretch">
      <Col xs={24} lg={10}>
        <Card title="Visit us" style={{ height: "100%" }}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <div>
              <Typography.Text strong>
                <EnvironmentOutlined /> {site.location.building}
              </Typography.Text>
              <Typography.Paragraph style={{ margin: 0 }}>
                {site.contact.address}
              </Typography.Paragraph>
            </div>

            <List
              size="small"
              header={<Typography.Text strong>Landmarks</Typography.Text>}
              dataSource={[...site.location.landmarks]}
              renderItem={(landmark) => <List.Item>{landmark}</List.Item>}
            />

            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
              {site.location.directionsNote}
            </Typography.Paragraph>

            <Button
              type="primary"
              icon={<CompassOutlined />}
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions
            </Button>
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={14}>
        {mapSrc && (
          <Image
            src={mapSrc}
            alt={campusMap.alt}
            width="100%"
            loading="lazy"
            style={{
              aspectRatio: `${campusMap.width} / ${campusMap.height}`,
              objectFit: "cover",
            }}
          />
        )}
      </Col>
    </Row>
  );
}
