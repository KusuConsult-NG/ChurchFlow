import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const prisma = new PrismaClient();

export const authOptions = {
  debug: process.env.NODE_ENV === 'development',
  // adapter: PrismaAdapter(prisma), // Temporarily disabled due to DB connection issues
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For testing, use hardcoded users (replace with database when connection is fixed)
        const testUsers = [
          {
            email: 'test@churchflow.com',
            password: 'password123',
            name: 'Test User',
            role: 'ADMIN'
          },
          {
            email: 'admin@churchflow.com',
            password: 'admin123',
            name: 'Admin User',
            role: 'ADMIN'
          },
          {
            email: 'member@churchflow.com',
            password: 'member123',
            name: 'Member User',
            role: 'MEMBER'
          }
        ];

        const user = testUsers.find(u => u.email === credentials.email);
        if (!user || user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.email, // Using email as ID for now
          email: user.email,
          name: user.name,
          role: user.role,
          districtId: null,
          agencyId: null
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔍 SignIn callback:', { user, account, profile });
      
      // Allow Google OAuth sign-in
      if (account?.provider === 'google') {
        console.log('✅ Google OAuth sign-in allowed');
        
        // Ensure user has required fields
        if (!user.email) {
          console.log('❌ Google user missing email');
          return false;
        }
        
        // Set default role for Google users
        if (!user.role) {
          user.role = 'MEMBER';
        }
        
        console.log('✅ Google user validated:', { email: user.email, role: user.role });
        return true;
      }
      
      // Allow credentials sign-in
      if (account?.provider === 'credentials') {
        console.log('✅ Credentials sign-in allowed');
        return true;
      }
      
      console.log('❌ Sign-in denied for provider:', account?.provider);
      return false;
    },
    async jwt({ token, user, account }) {
      console.log('🔍 JWT callback:', { token, user, account });
      
      if (user) {
        token.role = user.role || 'MEMBER';
        token.districtId = user.districtId;
        token.agencyId = user.agencyId;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('🔍 Session callback:', { session, token });
      
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role || 'MEMBER';
        session.user.districtId = token.districtId;
        session.user.agencyId = token.agencyId;
        session.user.provider = token.provider;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔍 Redirect callback:', { url, baseUrl });
      
      // Always redirect to dashboard after successful login
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  }
};

export default NextAuth(authOptions);
