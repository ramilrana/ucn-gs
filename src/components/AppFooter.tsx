import { Link } from 'react-router-dom';
import { Col, Divider, Layout, Row } from 'antd';
import { site } from '../data/site';

export function AppFooter() {
  return (
    <Layout.Footer className="site-footer">
      <div className="page-container">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={10}>
            <h2>{site.officeName}</h2>
            <p>{site.universityName}</p>
            <p>{site.tagline}</p>
          </Col>
          <Col xs={12} md={6}>
            <h2>Explore</h2>
            <ul>
              {site.navItems.map(({ path, label }) => (
                <li key={path}>
                  <Link to={path}>{label}</Link>
                </li>
              ))}
            </ul>
          </Col>
          <Col xs={12} md={8}>
            <h2>Contact</h2>
            <p>
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            </p>
            <p>{site.contact.phone}</p>
            <p>{site.contact.address}</p>
            <p>
              <a href={site.universityUrl} target="_blank" rel="noopener noreferrer">
                University website
              </a>
            </p>
          </Col>
        </Row>
        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        <p>
          © {new Date().getFullYear()} {site.universityName}. All rights reserved.
        </p>
      </div>
    </Layout.Footer>
  );
}
