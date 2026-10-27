import { delay, http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import type { Paginated } from '@/shared/types/api';
import {
  PRODUCT_CATEGORIES,
  productFormSchema,
  type Product,
  type ProductInput,
} from '../types/product';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

function seed(): Product[] {
  const names = [
    'Laptop Stand',
    'Mechanical Keyboard',
    'USB-C Hub',
    'Design Suite',
    'Code Editor Pro',
    'Backup Service',
    'Onboarding Workshop',
    'Noise-cancelling Headset',
    'Analytics Add-on',
    'Support Plan',
    '4K Monitor',
    'Webcam HD',
    'Password Manager',
    'Security Audit',
    'Docking Station',
  ];
  return names.map((name, index) => ({
    id: `p_${index + 1}`,
    name,
    description: `${name} for modern teams.`,
    category: PRODUCT_CATEGORIES[index % PRODUCT_CATEGORIES.length] ?? 'hardware',
    price: Math.round((19 + index * 13.5) * 100) / 100,
    stock: (index * 7) % 40,
    updatedAt: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(),
  }));
}

let products = seed();

export function resetProductsDb(data: Product[] = seed()) {
  products = structuredClone(data);
}

function validate(body: unknown) {
  const result = productFormSchema.safeParse(body);
  if (result.success) return { data: result.data };
  const errors = Object.fromEntries(
    result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  );
  return { response: HttpResponse.json({ message: 'Validation failed', errors }, { status: 422 }) };
}

function isNameTaken(input: ProductInput, exceptId?: string) {
  return products.some(
    (p) => p.id !== exceptId && p.name.toLowerCase() === input.name.toLowerCase(),
  );
}

const nameTaken = () =>
  HttpResponse.json(
    { message: 'Validation failed', errors: { name: 'A product with this name already exists.' } },
    { status: 422 },
  );

export const productHandlers = [
  http.get(url('/products'), async ({ request }) => {
    await delay();
    const query = new URL(request.url).searchParams;
    const page = Number(query.get('page') ?? 1);
    const pageSize = Number(query.get('pageSize') ?? 10);
    const search = query.get('search')?.toLowerCase() ?? '';
    const category = query.get('category');
    const [sortField = 'updatedAt', sortDir = 'desc'] = (query.get('sort') ?? '').split(':');

    const filtered = products
      .filter(
        (p) =>
          (!search || p.name.toLowerCase().includes(search)) &&
          (!category || p.category === category),
      )
      .sort((a, b) => {
        const av = a[sortField as keyof Product];
        const bv = b[sortField as keyof Product];
        const order = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'desc' ? -order : order;
      });

    const body: Paginated<Product> = {
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total: filtered.length,
    };
    return HttpResponse.json(body);
  }),

  http.get(url('/products/:id'), async ({ params }) => {
    await delay();
    const product = products.find((p) => p.id === params.id);
    if (!product) return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    return HttpResponse.json(product);
  }),

  http.post(url('/products'), async ({ request }) => {
    await delay();
    const { data, response } = validate(await request.json());
    if (!data) return response;
    if (isNameTaken(data)) return nameTaken();
    const product: Product = {
      ...data,
      id: `p_${crypto.randomUUID()}`,
      updatedAt: new Date().toISOString(),
    };
    products.unshift(product);
    return HttpResponse.json(product, { status: 201 });
  }),

  http.put(url('/products/:id'), async ({ params, request }) => {
    await delay();
    const index = products.findIndex((p) => p.id === params.id);
    if (index === -1) return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    const { data, response } = validate(await request.json());
    if (!data) return response;
    if (isNameTaken(data, String(params.id))) return nameTaken();
    const updated: Product = {
      ...data,
      id: String(params.id),
      updatedAt: new Date().toISOString(),
    };
    products[index] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete(url('/products/:id'), async ({ params }) => {
    await delay();
    products = products.filter((p) => p.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];
