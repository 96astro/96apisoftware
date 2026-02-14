'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPasswordSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";

export async function handleChangePassword(formData: FormData): Promise<
  | { success: true }
  | { error: string }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Please sign in again." };
  }

  const values = {
    password: formData.get("password")?.toString() ?? "",
    confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
    acceptTerms: true,
  };

  const validated = createPasswordSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Please provide a valid new password." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  });

  if (!user) {
    return { error: "User not found." };
  }

  if (user.password) {
    const sameAsCurrent = await bcrypt.compare(validated.data.password, user.password);
    if (sameAsCurrent) {
      return { error: "New password must be different from current password." };
    }
  }

  const nextHash = await bcrypt.hash(validated.data.password, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: nextHash },
  });

  return { success: true };
}
