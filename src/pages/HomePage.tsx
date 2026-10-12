import { Col, Row } from 'antd';
import { ContactBand } from '../components/ContactBand';
import { SectionHeading } from '../components/SectionHeading';
import { featuredImages, videoItems } from '../data/media';
import { ImageGrid } from '../features/gallery/components/ImageGrid';
import { VideoCard } from '../features/gallery/components/VideoCard';
import { HomeHero } from '../features/home/components/HomeHero';
import { ResearchAreas } from '../features/home/components/ResearchAreas';

export default function HomePage() {
  const [heroImage, ...otherFeatured] = featuredImages;

  return (
    <>
      <HomeHero image={heroImage} />

      <section className="section">
        <div className="page-container">
          <SectionHeading
            title="Featured work"
            description="Recent highlights from our research projects and events."
            actionLabel="View the full gallery"
            actionTo="/gallery"
          />
          <ImageGrid items={otherFeatured.slice(0, 3)} />
        </div>
      </section>

      <section className="section section--alt">
        <div className="page-container">
          <SectionHeading
            title="Research areas"
            description="The themes that bring our researchers together."
            actionLabel="About the office"
            actionTo="/about"
          />
          <ResearchAreas />
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <SectionHeading
            title="Latest videos"
            description="Watch our events, facilities and researchers in action."
            actionLabel="All videos"
            actionTo="/videos"
          />
          <Row gutter={[24, 24]}>
            {videoItems.slice(0, 2).map((item) => (
              <Col key={item.id} xs={24} md={12}>
                <VideoCard item={item} />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <ContactBand />
    </>
  );
}
