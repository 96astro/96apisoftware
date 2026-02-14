import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
// import GitHub from "next-auth/providers/github"
// import Google from "next-auth/providers/google"
import { ZodError } from "zod"
import { prisma } from "./lib/prisma"
import { loginSchema } from "./lib/zod"
import { getUserFromDb } from "./utils/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = Number(user.id)
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const tokenId = token.id ?? token.sub
        ;(session.user as { id: number }).id = typeof tokenId === "number" ? tokenId : Number(tokenId || 0)
      }
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await loginSchema.parseAsync(credentials)

          const user = await getUserFromDb(email, password)

          if (!user) {
            return null
          }
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
          }
        } 
        catch (error) {
          if (error instanceof ZodError) {
            return null
          }
          return null
        }
      }
    }),

    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //   authorization: {
    //     params: {
    //       prompt: "consent",
    //       access_type: "offline",
    //       response_type: "code",
    //     },
    //   },
    // }),
    // GitHub({
    //   clientId: process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    //   authorization: {
    //     params: {
    //       prompt: "consent",
    //       access_type: "offline",
    //       response_type: "code",
    //     },
    //   },
    // }),
  ],
})
