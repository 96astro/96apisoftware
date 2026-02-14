"use server";

import { sendVerificationEmail } from "@/lib/mailer";
import { registerSchema } from "@/lib/zod";
import { createEmailVerificationToken, createUser } from "@/utils/db";

export async function registerUser(formData: FormData): Promise<
  | { success: true }
  | { error: string }
> {
  try {
    const username = formData.get("username")?.toString() ?? "";
    const name = formData.get("name")?.toString() ?? "";
    const email = formData.get("email")?.toString() ?? "";
    const phone = formData.get("phone")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const acceptTerms = formData.get("acceptTerms") === "on";

    const result = registerSchema.safeParse({
      username,
      name,
      email,
      phone,
      password,
      acceptTerms,
    });

    if (!result.success) {
      const errorMessages = result.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return { error: `Validation error: ${errorMessages}` };
    }

    const created = await createUser({
      username: result.data.username,
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      password: result.data.password,
    });

    if ("error" in created) {
      return { error: created.error };
    }

    const verificationToken = await createEmailVerificationToken(result.data.email);

    if (!verificationToken) {
      return { error: "Unable to create email verification token." };
    }

    const appUrl =
      process.env.APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;

    await sendVerificationEmail({
      to: result.data.email,
      verifyUrl,
    });

    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "Something went wrong during registration." };
  }
}

