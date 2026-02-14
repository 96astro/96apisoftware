'use server'

import { sendPasswordResetEmail } from '@/lib/mailer'
import { forgotPasswordSchema } from '@/lib/zod'
import { createPasswordResetToken } from '@/utils/db'

export async function handleForgotPasswordAction(formData: FormData) {
  const email = formData.get('email')
  console.log("[forgot-password] request received", { email })

  const parsed = forgotPasswordSchema.safeParse({ email })

  if (!parsed.success) {
    console.warn("[forgot-password] invalid email payload", {
      issues: parsed.error.issues.map((i) => i.message),
    })
    return {
      success: false,
      error: 'Please provide a valid email address.',
    }
  }

  const resetToken = await createPasswordResetToken(parsed.data.email)
  console.log("[forgot-password] token generation result", {
    email: parsed.data.email,
    userFound: Boolean(resetToken),
  })

  if (!resetToken) {
    console.log("[forgot-password] no user for email, returning generic success", {
      email: parsed.data.email,
    })
    return { success: true }
  }

  const appUrl =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  const resetUrl = `${appUrl}/auth/create-password?token=${encodeURIComponent(resetToken)}`
  console.log("[forgot-password] attempting SMTP send", {
    to: parsed.data.email,
    appUrl,
  })

  try {
    const messageId = await sendPasswordResetEmail({
      to: parsed.data.email,
      resetUrl,
    })
    console.log("[forgot-password] reset email sent", {
      to: parsed.data.email,
      messageId,
    })
    return { success: true }
  } catch (error) {
    console.error("[forgot-password] failed to send reset email", {
      to: parsed.data.email,
      error: error instanceof Error ? error.message : String(error),
    })
    return {
      success: false,
      error: "Unable to send reset email right now. Please try again later.",
    }
  }
}
