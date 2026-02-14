import { verifyEmailWithToken } from "@/utils/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login?verified=missing", appUrl));
  }

  const verified = await verifyEmailWithToken(token);

  if (!verified) {
    return NextResponse.redirect(new URL("/auth/login?verified=failed", appUrl));
  }

  return NextResponse.redirect(new URL("/auth/login?verified=success", appUrl));
}
