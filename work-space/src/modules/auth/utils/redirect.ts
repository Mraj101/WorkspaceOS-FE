export const LOGIN_PATH = '/login';
export const REDIRECT_PARAM = 'redirectTo';
const DEFAULT_REDIRECT = '/';

/**
 * Only allow same-origin, absolute-path redirects. Rejects "//evil.com", "https://…",
 * and "/\evil.com" so the redirect parameter can't be used for open-redirect phishing.
 */
export function safeRedirectPath(value: string | null | undefined): string {
  if (!value?.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return DEFAULT_REDIRECT;
  }
  return value;
}

export function loginPathWithRedirect(currentPath: string): string {
  if (currentPath === DEFAULT_REDIRECT) return LOGIN_PATH;
  return `${LOGIN_PATH}?${new URLSearchParams({ [REDIRECT_PARAM]: currentPath }).toString()}`;
}
