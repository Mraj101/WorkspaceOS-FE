import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/** Every route-level page renders exactly one PageHeader, which owns the <h1> and document title. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  useDocumentTitle(title);

  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}
