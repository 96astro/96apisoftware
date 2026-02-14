'use server'

import { loginSchema } from "@/lib/zod"
import { getUserByEmail, getUserFromDb } from "@/utils/db"

export const handleLoginAction = async (formData: FormData) => {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: "Please enter a valid email and password." }
  }

  const account = await getUserByEmail(parsed.data.email)

  if (account && !account.emailVerified) {
    return { error: "Please verify your email before signing in." }
  }

  const user = await getUserFromDb(parsed.data.email, parsed.data.password)

  if (!user) {
    return { error: "Invalid email or password." }
  }

  return { success: true }
}
