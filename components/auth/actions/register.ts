"use server";

import { registerSchema } from "@/lib/zod";
import { createUser } from "@/utils/db";

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

    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "Something went wrong during registration." };
  }
}

