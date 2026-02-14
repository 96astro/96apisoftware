'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function handleProfileUpdate(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const name = formData.get('name')?.toString().trim() ?? "";
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? "";
  const phone = formData.get('number')?.toString().trim() || null;
  const department = formData.get('department')?.toString().trim() || null;
  const designation = formData.get('designation')?.toString().trim() || null;
  const language = formData.get('language')?.toString().trim() || null;
  const bio = formData.get('desc')?.toString().trim() || null;

  if (!name || !email) {
    redirect("/view-profile?updated=error");
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        phone,
        department,
        designation,
        language,
        bio,
      },
    });
  } catch (error) {
    redirect("/view-profile?updated=error");
  }

  revalidatePath("/view-profile");
  redirect("/view-profile?updated=success");
}
