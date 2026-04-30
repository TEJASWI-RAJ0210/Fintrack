import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      try {
        const { upsertUser } = await import('./db.js')
        const dbUser = await upsertUser({
          email: user.email,
          name:  user.name,
          image: user.image,
        })
        user.dbId = dbUser.id
      } catch {
        // DB not connected yet — login still works during dev
        console.warn('[Auth] DB not connected, skipping upsertUser')
      }
      return true
    },

    async jwt({ token, user }) {
      // On first sign-in, user object is available — grab dbId
      if (user?.dbId) {
        token.dbId = user.dbId
      }

      // On subsequent requests, try fetching from DB if dbId missing
      if (!token.dbId) {
        try {
          const { query } = await import('./db.js')
          const res = await query(
            'SELECT id FROM users WHERE email = $1',
            [token.email]
          )
          if (res.rows[0]) token.dbId = res.rows[0].id
        } catch {
          // DB not available, skip silently
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token?.dbId) {
        session.user.id = token.dbId
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
}