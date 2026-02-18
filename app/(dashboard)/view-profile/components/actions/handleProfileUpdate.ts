'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const parseIntOrNull = (value: string | null) => {
  if (!value) return null;
  const num = Number.parseInt(value, 10);
  return Number.isNaN(num) ? null : num;
};

const parseFloatOrNull = (value: string | null) => {
  if (!value) return null;
  const num = Number.parseFloat(value);
  return Number.isNaN(num) ? null : num;
};

export async function handleProfileUpdate(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const name = formData.get('name')?.toString().trim() ?? "";
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? "";
  const profileImageRaw = formData.get("profileImageData")?.toString().trim() ?? "";
  const profileImage = profileImageRaw || null;
  const phoneCountryCodeRaw = formData.get('phoneCountryCode')?.toString().trim() || "+91";
  const phoneCountryCode = /^\+\d{1,4}$/.test(phoneCountryCodeRaw) ? phoneCountryCodeRaw : "+91";
  const phone = formData.get('number')?.toString().trim() || null;
  const department = formData.get('department')?.toString().trim() || null;
  const designation = formData.get('designation')?.toString().trim() || null;
  const language = formData.get('language')?.toString().trim() || null;
  const bio = formData.get('desc')?.toString().trim() || null;
  const dateOfBirthRaw = formData.get('dateOfBirth')?.toString().trim() || null;
  const birthTime = formData.get('birthTime')?.toString().trim() || null;
  const placeOfBirth = formData.get('placeOfBirth')?.toString().trim() || null;
  const latitudeDeg = parseIntOrNull(formData.get("latitudeDeg")?.toString().trim() || null);
  const latitudeMin = parseIntOrNull(formData.get("latitudeMin")?.toString().trim() || null);
  const latitudeDirValue = formData.get('latitudeDir')?.toString().trim() || null;
  const latitudeDir = latitudeDirValue === "N" || latitudeDirValue === "S" ? latitudeDirValue : null;
  const longitudeDeg = parseIntOrNull(formData.get("longitudeDeg")?.toString().trim() || null);
  const longitudeMin = parseIntOrNull(formData.get("longitudeMin")?.toString().trim() || null);
  const longitudeDirValue = formData.get('longitudeDir')?.toString().trim() || null;
  const longitudeDir = longitudeDirValue === "E" || longitudeDirValue === "W" ? longitudeDirValue : null;
  const timezone = parseFloatOrNull(formData.get("timezone")?.toString().trim() || null);
  const kpHoraryNumber = parseIntOrNull(formData.get("kpHoraryNumber")?.toString().trim() || null);

  const dateOfBirth = dateOfBirthRaw ? new Date(`${dateOfBirthRaw}T00:00:00.000Z`) : null;

  if (!name || !email) {
    redirect("/view-profile?updated=error");
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        image: profileImage,
        phoneCountryCode,
        phone,
        department,
        designation,
        language,
        bio,
        dateOfBirth,
        birthTime,
        placeOfBirth,
        latitudeDeg,
        latitudeMin,
        latitudeDir,
        longitudeDeg,
        longitudeMin,
        longitudeDir,
        timezone,
        kpHoraryNumber,
      },
    });
  } catch (error) {
    redirect("/view-profile?updated=error");
  }

  revalidatePath("/view-profile");
  redirect("/view-profile?updated=success");
}
