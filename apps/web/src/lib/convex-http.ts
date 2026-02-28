import { ConvexHttpClient } from 'convex/browser';

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is required');
}

export const httpClient = new ConvexHttpClient(url);

// Lazy-load to avoid TS6059 rootDir issues with convex/_generated/api
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _api: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getApi(): any {
  if (!_api) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _api = require('../../../../convex/_generated/api').api;
  }
  return _api;
}
