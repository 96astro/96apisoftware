import { auth } from "@/auth";
import { compressToBase64 } from "@/lib/compression";
import { buildLifeCalculatorPayload, toBirthDateAtUtcMidnight } from "@/lib/life-calculator";
import { prisma } from "@/lib/prisma";
import { lifeCalculatorSchema } from "@/lib/zod";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type ApiEnvelope = {
  job_id?: string;
  status?: string;
};

const LIFE_CALCULATOR_API_URL =
  process.env.LIFE_CALCULATOR_API_URL ||
  "https://96apisoftware.96astro.com/96astro/api/v1/life-calculator?sync=true";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.LIFE_CALCULATOR_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Missing LIFE_CALCULATOR_API_TOKEN in environment." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const parsed = lifeCalculatorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid life calculator payload.",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const values = parsed.data;
  let apiPayload;

  try {
    apiPayload = buildLifeCalculatorPayload(values);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid payload values.",
      },
      { status: 400 }
    );
  }

  const upstreamResponse = await fetch(LIFE_CALCULATOR_API_URL, {
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
        error: "Life calculator API request failed.",
        status: upstreamResponse.status,
        response: apiResponseJson,
      },
      { status: 502 }
    );
  }

  const envelope = (apiResponseJson ?? {}) as ApiEnvelope;

  const reportDelegate = (prisma as { lifeCalculatorReport?: { create: Function } }).lifeCalculatorReport;

  if (!reportDelegate?.create) {
    return NextResponse.json(
      {
        error:
          "Prisma client is out of date in the running server process. Restart dev server and run `npx prisma generate`.",
      },
      { status: 500 }
    );
  }

  const responsePreview = {
    status: envelope.status ?? null,
    job_id: envelope.job_id ?? null,
  } as Prisma.InputJsonValue;

  const created = await reportDelegate.create({
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
      responseRaw: compressToBase64(responseText || JSON.stringify(apiResponseJson ?? null)),
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
