import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { ConvexHttpClient } from 'convex/browser';

declare module 'next-auth' {
  interface Session {
    convexUserId?: string;
  }
  interface User {
    convexUserId?: string;
  }
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Lazy-load to avoid TS6059 rootDir issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _api: any;
function getApi() {
  if (!_api) {
    // eslint-disable-next-line @nx/enforce-module-boundaries
    _api = require('../../../../convex/_generated/api').api;
  }
  return _api;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      try {
        const convexUserId = await convex.mutation(getApi().service.findOrCreateUser, {
          serviceToken: process.env.CONVEX_SERVICE_TOKEN!,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          image: user.image ?? undefined,
        });
        user.convexUserId = convexUserId;
      } catch (err) {
        console.error('Failed to find/create Convex user:', err);
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.convexUserId) {
        token.convexUserId = user.convexUserId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.convexUserId) {
        session.convexUserId = token.convexUserId as string;
      }
      return session;
    },
  },
});
