'use server';

import { createPasswordSchema } from "@/lib/zod";
import { resetPasswordWithToken } from "@/utils/db";

export async function handleResetPassword(formData: FormData) {
  const token = formData.get("token")?.toString() ?? "";

  if (!token) {
    return { error: "Invalid or expired reset link." };
  }

  const values = {
    password: formData.get("password")?.toString() ?? "",
    confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
    acceptTerms: formData.get("acceptTerms") === "on",
  };

  const result = createPasswordSchema.safeParse(values);

  if (!result.success) {
    return { error: "Please fix the form errors and try again." };
  }

  const updated = await resetPasswordWithToken(token, result.data.password);

  if (!updated) {
    return { error: "Invalid or expired reset link." };
  }

  return { success: true };
}
