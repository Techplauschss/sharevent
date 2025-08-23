import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "./generated/prisma"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  providers: [
    // Einfache Telefonnummer-Authentifikation ohne SMS
    Credentials({
      id: "phone-login",
      name: "Phone Login",
      credentials: {
        phone: { label: "Telefonnummer", type: "tel" }
      },
      async authorize(credentials) {
        console.log('🔐 Authorization attempt with credentials:', JSON.stringify(credentials, null, 2))
        const phone = credentials?.phone as string
        
        if (!phone) {
          console.log('❌ No phone provided')
          return null
        }

        console.log('📞 Original phone input:', `"${phone}"`)

        // Normalisiere Telefonnummer (entferne Leerzeichen, Bindestriche etc.)
        const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '')
        console.log('📱 Normalized phone:', `"${normalizedPhone}"`)

        // Validiere deutsche Telefonnummer (einfache Validierung)
        const phoneRegex = /^(\+49|0)[1-9]\d{7,11}$/
        const isValidFormat = phoneRegex.test(normalizedPhone)
        console.log('🔍 Phone validation:')
        console.log('  - Regex pattern:', phoneRegex.source)
        console.log('  - Test result:', isValidFormat)
        console.log('  - Phone length:', normalizedPhone.length)
        
        if (!isValidFormat) {
          console.log('❌ Invalid phone format:', normalizedPhone)
          console.log('❌ Expected format: +49 or 0 followed by 1-9 and 7-11 more digits')
          return null
        }

        try {
          console.log('🔗 Attempting database connection...')
          
          // Prüfe ob Benutzer bereits existiert, wenn nicht, erstelle einen neuen
          let user = await prisma.user.findUnique({
            where: { phone: normalizedPhone }
          })
          console.log('👤 Found existing user:', user ? user.id : 'none')
          console.log('👤 User details:', user ? JSON.stringify(user, null, 2) : 'none')

          if (!user) {
            console.log('🆕 Creating new user for phone:', normalizedPhone)
            user = await prisma.user.create({
              data: {
                phone: normalizedPhone,
                phoneVerified: new Date(),
                name: `Benutzer ${normalizedPhone.slice(-4)}`, // Fallback-Name mit letzten 4 Ziffern
              }
            })
            console.log('✅ Created new user:', JSON.stringify(user, null, 2))
          }

          console.log('✅ Returning user object:', {
            id: user.id,
            name: user.name,
            phone: user.phone
          })

          const userResult = {
            id: user.id,
            name: user.name,
            phone: user.phone,
            image: user.image
          }
          
          console.log('✅ Final user result:', JSON.stringify(userResult, null, 2))
          return userResult
        } catch (error) {
          console.error('❌ Database error during authorization:', error)
          console.error('❌ Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
          })
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.phone = token.phone as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.phone = user.phone
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect called with:', { url, baseUrl })
      
      // Nach erfolgreichem Login zur Events-Seite weiterleiten
      if (url === `${baseUrl}/auth/signin` || url === baseUrl || url === `${baseUrl}/`) {
        const redirectUrl = `${baseUrl}/events`
        console.log('🎯 Redirecting to:', redirectUrl)
        return redirectUrl
      }
      
      // Stelle sicher, dass die URL zur gleichen Domain gehört
      if (url.startsWith(baseUrl)) {
        console.log('🎯 Same domain redirect to:', url)
        return url
      }
      
      // Fallback zur Events-Seite
      const fallbackUrl = `${baseUrl}/events`
      console.log('🎯 Fallback redirect to:', fallbackUrl)
      return fallbackUrl
    }
  },
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
  pages: {
    signIn: '/auth/signin',
  }
})
