'use server'

import { loginSchema } from "@/lib/zod"
import { getUserFromDb } from "@/utils/db"

export const handleLoginAction = async (formData: FormData) => {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: "Please enter a valid email and password." }
  }

  const user = await getUserFromDb(parsed.data.email, parsed.data.password)

  if (!user) {
    return { error: "Invalid email or password." }
  }

  return { success: true }
}
