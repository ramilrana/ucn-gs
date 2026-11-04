import { useEffect } from 'react';

const SITE_TITLE = 'UCN Graduate School';
const HOME_TITLE = 'UCN Graduate School Accreditation';

/** Sets document.title to "{title} · UCN Graduate School". The Home entry ("Home") gets the bare site title. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title === 'Home' ? HOME_TITLE : `${title} · ${SITE_TITLE}`;
  }, [title]);
}
