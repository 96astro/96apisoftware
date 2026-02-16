import { auth } from "@/auth";
import { buildAstroFormPayload, toBirthDateAtUtcMidnight } from "@/lib/astro-form";
import { prisma } from "@/lib/prisma";
import { astroFormSchema } from "@/lib/zod";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type ApiEnvelope = {
  job_id?: string;
  status?: string;
};

const ASTRO_FORM_API_URL =
  process.env.ASTRO_FORM_API_URL || "";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.ASTRO_FORM_API_TOKEN || process.env.LIFE_CALCULATOR_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Missing ASTRO_FORM_API_TOKEN (or LIFE_CALCULATOR_API_TOKEN) in environment." },
      { status: 500 }
    );
  }
  if (!ASTRO_FORM_API_URL) {
    return NextResponse.json(
      { error: "Missing ASTRO_FORM_API_URL in environment." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const parsed = astroFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid astro form payload.",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const values = parsed.data;
  let apiPayload;

  try {
    apiPayload = buildAstroFormPayload(values);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid payload values.",
      },
      { status: 400 }
    );
  }

  const upstreamResponse = await fetch(ASTRO_FORM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(apiPayload),
    cache: "no-store",
  });

  const responseText = await upstreamResponse.text();
  let apiResponseJson: unknown = null;

  try {
    apiResponseJson = responseText ? JSON.parse(responseText) : null;
  } catch {
    apiResponseJson = { raw: responseText };
  }

  if (!upstreamResponse.ok) {
    return NextResponse.json(
      {
        error: "Astro form API request failed.",
        status: upstreamResponse.status,
        response: apiResponseJson,
      },
      { status: 502 }
    );
  }

  const envelope = (apiResponseJson ?? {}) as ApiEnvelope;
  const responsePreview = {
    status: envelope.status ?? null,
    job_id: envelope.job_id ?? null,
  } as Prisma.InputJsonValue;

  const created = await prisma.astroFormReport.create({
    data: {
      userId: session.user.id,
      name: values.name,
      gender: values.gender,
      placeOfBirth: values.placeOfBirth,
      birthDate: toBirthDateAtUtcMidnight(values.birthDate),
      birthTime: values.birthTime,
      day: apiPayload.day,
      month: apiPayload.month,
      year: apiPayload.year,
      hour: apiPayload.hour,
      minute: apiPayload.minute,
      second: apiPayload.second,
      longitudeDeg: apiPayload.longitude_deg,
      longitudeMin: apiPayload.longitude_min,
      longitudeDir: apiPayload.longitude_dir,
      latitudeDeg: apiPayload.latitude_deg,
      latitudeMin: apiPayload.latitude_min,
      latitudeDir: apiPayload.latitude_dir,
      timezone: apiPayload.timezone,
      chartStyle: apiPayload.chart_style,
      kpHoraryNumber: apiPayload.kp_horary_number,
      requestPayload: apiPayload as Prisma.InputJsonValue,
      responseJson: responsePreview,
      responseRaw: responseText || JSON.stringify(apiResponseJson ?? null),
      apiJobId: envelope.job_id ?? null,
      apiStatus: envelope.status ?? null,
    },
  });

  return NextResponse.json(
    {
      success: true,
      reportId: created.id,
      apiStatus: created.apiStatus,
      apiJobId: created.apiJobId,
    },
    { status: 201 }
  );
}
