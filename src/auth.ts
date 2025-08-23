import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  providers: [
    Credentials({
      id: "phone-login",
      name: "Phone Login",
      credentials: {
        phone: { label: "Telefonnummer", type: "tel" }
      },
      async authorize(credentials: any) {
        const phone = credentials?.phone as string;
        if (!phone) return null;
  const normalizedPhone = phone.replace(/\D/g, ''); // Nur Ziffern
  const phoneRegex = /^\d{6,15}$/; // 6-15 Ziffern
  if (!phoneRegex.test(normalizedPhone)) return null;
        try {
          let user = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                phone: normalizedPhone,
                phoneVerified: new Date(),
                name: `Benutzer ${normalizedPhone.slice(-4)}`,
              }
            });
          }
          if (!user) return null;
          return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            image: user.image
          };
        } catch (err) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async session({ token, session }: { token: any, session: any }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
    async jwt({ token, user }: { token: any, user?: any }) {
      if (typeof user !== 'undefined' && user !== null) {
        token.phone = user.phone;
      }
      return token;
    },
    async redirect({ url, baseUrl }: { url: any, baseUrl: any }) {
      if (url === `${baseUrl}/auth/signin` || url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/events`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/events`;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  trustHost: true,
  pages: {
    signIn: '/auth/signin'
  }
});
