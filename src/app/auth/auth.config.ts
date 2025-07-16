// src/app/auth/auth.config.ts
import { DefaultSession } from "next-auth";

// Extend the built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

export const authConfig = {
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
  },
  providers: [], // Will be added in auth.ts
  callbacks: {
    authorized({ auth, request }: { auth: any; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const { nextUrl } = request;
      
      const isOnChat = nextUrl.pathname.startsWith('/');
      const isOnLoanApplication = nextUrl.pathname.startsWith('/loan-application');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnWicVerification = nextUrl.pathname.startsWith('/wic-verification');

      // Always redirect to home if logged in and trying to access auth pages
      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl));
      }

      // Always allow access to authentication pages
      if (isOnRegister || isOnLogin) {
        return true;
      }

      // Protect chat and loan application pages
      if (isOnChat || isOnLoanApplication || isOnWicVerification) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
    jwt({ token, user, account }: { token: any; user: any; account: any }) {
      // Add WICFIN tokens to the session
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.userId = user.id;
      }
      return token;
    },
    session({ session, token }: { session: any; token: any }) {
      // Add user ID and tokens to the session
      if (session.user) {
        session.user.id = token.userId;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.expiresAt = token.expiresAt;
      }
      return session;
    }
  },
};