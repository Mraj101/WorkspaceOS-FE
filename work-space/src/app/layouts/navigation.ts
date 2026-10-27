import { productPaths } from '@/modules/products';

export interface NavItem {
  label: string;
  to: string;
}

/** Primary navigation. Adding a module's entry here is the only app-level change it needs. */
export const primaryNav: NavItem[] = [{ label: 'Products', to: productPaths.list() }];
