import { authHandlers } from '@/modules/auth/mocks/handlers';
import { productHandlers, resetProductsDb } from '@/modules/products/mocks/handlers';

// Each module owns its mock handlers; this file only composes them.
export const handlers = [...authHandlers, ...productHandlers];

export function resetMockData() {
  resetProductsDb();
}
