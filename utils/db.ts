import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

type SafeUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserFromDb(email: string, password: string): Promise<SafeUser | null> {
  const user = await getUserByEmail(email);

  if (!user?.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid || !user.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function createUser(input: {
  username: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ user: { id: string } } | { error: string }> {
  const [emailUser, usernameUser, phoneUser] = await Promise.all([
    getUserByEmail(input.email),
    prisma.user.findUnique({ where: { username: input.username } }),
    prisma.user.findUnique({ where: { phone: input.phone } }),
  ]);

  if (emailUser) {
    return { error: "User already exists with this email." };
  }

  if (usernameUser) {
    return { error: "Username is already taken." };
  }

  if (phoneUser) {
    return { error: "Phone number is already in use." };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      username: input.username,
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: passwordHash,
    },
  });

  return { user: { id: user.id } };
}

export async function createPasswordResetToken(email: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expires = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expires,
    },
  });

  return rawToken;
}

export async function resetPasswordWithToken(rawToken: string, nextPassword: string) {
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const storedToken = await prisma.passwordResetToken.findFirst({
    where: {
      token: hashedToken,
      usedAt: null,
      expires: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!storedToken) {
    return false;
  }

  const passwordHash = await bcrypt.hash(nextPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: storedToken.userId },
      data: { password: passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return true;
}
