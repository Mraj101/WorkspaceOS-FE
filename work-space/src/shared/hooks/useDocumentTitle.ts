import { useEffect } from 'react';
import { APP_NAME } from '@/shared/constants/app';

/** Set a descriptive page title so screen-reader users hear where they landed. */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
