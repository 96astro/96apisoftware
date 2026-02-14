'use server'

import { forgotPasswordSchema } from '@/lib/zod'
import { createPasswordResetToken } from '@/utils/db'

export async function handleForgotPasswordAction(formData: FormData) {
  const email = formData.get('email')
  const parsed = forgotPasswordSchema.safeParse({ email })

  if (!parsed.success) {
    return {
      success: false,
      error: 'Please provide a valid email address.',
    }
  }

  // In production this token should be emailed to the user.
  const resetToken = await createPasswordResetToken(parsed.data.email)

  return {
    success: true,
    resetToken,
  }
}
