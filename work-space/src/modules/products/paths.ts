/** URL builders owned by the products module. Other modules link via these, never hardcoded strings. */
export const productPaths = {
  list: () => '/products',
  create: () => '/products/new',
  edit: (id: string) => `/products/${encodeURIComponent(id)}/edit`,
};
