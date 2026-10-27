import { describe, expect, it } from 'vitest';
import { loginPathWithRedirect, safeRedirectPath } from './redirect';

describe('safeRedirectPath', () => {
  it.each([
    ['/products?page=2', '/products?page=2'],
    [null, '/'],
    ['', '/'],
    ['https://evil.example', '/'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    ['javascript:alert(1)', '/'],
  ])('%s -> %s', (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });
});

describe('loginPathWithRedirect', () => {
  it('encodes the current location', () => {
    expect(loginPathWithRedirect('/products?page=2')).toBe(
      '/login?redirectTo=%2Fproducts%3Fpage%3D2',
    );
  });

  it('omits the parameter for the home page', () => {
    expect(loginPathWithRedirect('/')).toBe('/login');
  });
});
