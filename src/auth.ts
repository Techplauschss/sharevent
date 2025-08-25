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
        console.log('[auth] Authorize gestartet. Environment:', {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: process.env.DATABASE_URL,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        });
        const phone = credentials?.phone as string;
        if (!phone) {
          console.error('[auth] Kein Phone-Input erhalten:', credentials);
          throw new Error('Keine Telefonnummer angegeben.');
        }
        const normalizedPhone = phone.replace(/\D/g, ''); // Nur Ziffern
        const phoneRegex = /^\d{6,15}$/; // 6-15 Ziffern
        if (!phoneRegex.test(normalizedPhone)) {
          console.error('[auth] Telefonnummer entspricht nicht dem erwarteten Format:', phone, '->', normalizedPhone);
          throw new Error('Ungültiges Telefonnummernformat.');
        }
        try {
          let user = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
          if (!user) {
            console.warn('[auth] Kein User mit dieser Nummer gefunden:', normalizedPhone);
            user = await prisma.user.create({
              data: {
                phone: normalizedPhone,
                phoneVerified: new Date(),
                name: `Benutzer ${normalizedPhone.slice(-4)}`,
              }
            });
            console.log('[auth] Neuer User angelegt:', user);
          }
          if (!user) {
            console.error('[auth] User konnte nicht angelegt werden:', normalizedPhone);
            throw new Error('Benutzer konnte nicht angelegt werden.');
          }
          console.log('[auth] Erfolgreiche Authorisierung:', {
            id: user.id,
            name: user.name,
            phone: user.phone,
            image: user.image
          });
          return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            image: user.image
          };
        } catch (err: any) {
          console.error('[auth] Fehler bei der Authorisierung:', err?.message, err);
          throw new Error('Interner Fehler bei der Anmeldung: ' + (err?.message || 'Unbekannt'));
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
