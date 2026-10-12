import { Tabs } from 'antd';
import { CATEGORY_FILTERS, CATEGORY_LABELS, isCategoryFilter, type CategoryFilter } from '../categories';

interface MediaFilterProps {
  value: CategoryFilter;
  onChange: (next: CategoryFilter) => void;
}

const tabItems = CATEGORY_FILTERS.map((key) => ({ key, label: CATEGORY_LABELS[key] }));

export function MediaFilter({ value, onChange }: MediaFilterProps) {
  return (
    <Tabs
      activeKey={value}
      items={tabItems}
      onChange={(key) => {
        if (isCategoryFilter(key)) onChange(key);
      }}
    />
  );
}
