import { useCallback, useMemo, useState } from 'react';
import type { MediaItem } from '../../../types/media';
import type { CategoryFilter } from '../categories';

const PAGE_SIZE = 12;

export function useMediaFilter<T extends MediaItem>(items: readonly T[]) {
  const [category, setCategoryState] = useState<CategoryFilter>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (category === 'all' ? items : items.filter((item) => item.category === category)),
    [items, category],
  );

  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const setCategory = useCallback((next: CategoryFilter) => {
    setCategoryState(next);
    setPage(1);
  }, []);

  return { category, setCategory, page, setPage, pageSize: PAGE_SIZE, total: filtered.length, paged };
}
