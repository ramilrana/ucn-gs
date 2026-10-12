import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Card, Col, Descriptions, Row, Space, Typography } from "antd";
import { PageBanner } from "../components/PageBanner";
import { SectionHeading } from "../components/SectionHeading";
import { site } from "../data/site";
import { LocationSection } from "../features/about/components/LocationSection";
import { StaffDirectory } from "../features/about/components/StaffDirectory";
// import { ResearchAreas } from "../features/home/components/ResearchAreas";

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title={`About the ${site.officeName}`}
        description="Who we are, who to talk to, and how to find us."
      />

      <div className="page-container page-body page-body--intro">
        <Row gutter={[48, 32]}>
          <Col xs={24} lg={14}>
            {site.about.map((paragraph) => (
              <Typography.Paragraph
                key={paragraph}
                style={{ fontSize: 17, lineHeight: 1.7 }}
              >
                {paragraph}
              </Typography.Paragraph>
            ))}
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Contact the office">
              <Descriptions
                column={1}
                layout="vertical"
                items={[
                  {
                    key: "email",
                    label: (
                      <Space size={8}>
                        <MailOutlined />
                        Email
                      </Space>
                    ),
                    children: (
                      <Typography.Link href={`mailto:${site.contact.email}`}>
                        {site.contact.email}
                      </Typography.Link>
                    ),
                  },
                  {
                    key: "phone",
                    label: (
                      <Space size={8}>
                        <PhoneOutlined />
                        Phone
                      </Space>
                    ),
                    children: site.contact.phone,
                  },
                  {
                    key: "address",
                    label: (
                      <Space size={8}>
                        <EnvironmentOutlined />
                        Address
                      </Space>
                    ),
                    children: site.contact.address,
                  },
                  {
                    key: "hours",
                    label: "Office hours",
                    children: site.contact.hours,
                  },
                  {
                    key: "web",
                    label: "University website",
                    children: (
                      <Typography.Link
                        href={site.universityUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {site.universityName}
                      </Typography.Link>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <section className="section section--alt" id="staff">
        <div className="page-container">
          <SectionHeading title="Faculty and staff" />
          <StaffDirectory />
        </div>
      </section>

      <section className="section" id="location">
        <div className="page-container">
          <SectionHeading title="Location" />
          <LocationSection />
        </div>
      </section>

      {/* <section className="section section--alt">
        <div className="page-container">
          <SectionHeading title="Research areas" />
          <ResearchAreas />
        </div>
      </section> */}
    </>
  );
}
