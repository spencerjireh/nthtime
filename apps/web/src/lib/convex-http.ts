import { ConvexHttpClient } from 'convex/browser';

// eslint-disable-next-line @nx/enforce-module-boundaries
export { api } from '../../../../convex/_generated/api.js';

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is required');
}

export const httpClient = new ConvexHttpClient(url);
