import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.githubUsername = (profile as any).login
        token.githubAvatar = (profile as any).avatar_url
        token.pubkyId = `pk:gh-${(profile as any).login}`
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session as any).pubkyId = (token as any).pubkyId
        (session as any).githubUsername = (token as any).githubUsername
      }
      return session
    },
  },
})
