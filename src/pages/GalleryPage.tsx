import { Flex, Grid, Pagination } from 'antd';
import { PageBanner } from '../components/PageBanner';
import { imageItems } from '../data/media';
import { ImageGrid } from '../features/gallery/components/ImageGrid';
import { MediaFilter } from '../features/gallery/components/MediaFilter';
import { useMediaFilter } from '../features/gallery/hooks/useMediaFilter';

export default function GalleryPage() {
  const screens = Grid.useBreakpoint();
  const { category, setCategory, page, setPage, pageSize, total, paged } =
    useMediaFilter(imageItems);

  return (
    <>
      <PageBanner
        title="Gallery"
        description="Photographs of our research, events, people and facilities."
      />
      <div className="page-container page-body">
        <Flex vertical gap={24}>
          <MediaFilter value={category} onChange={setCategory} />
          <ImageGrid items={paged} />
          <Flex justify="center">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={setPage}
              showSizeChanger={false}
              hideOnSinglePage
              simple={!screens.sm}
            />
          </Flex>
        </Flex>
      </div>
    </>
  );
}
