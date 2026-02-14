import { auth } from "@/auth";
import { buildAyuMilanPayload, toBirthDateAtUtcMidnight } from "@/lib/ayu-milan";
import { splitTextBySize } from "@/lib/compression";
import { prisma } from "@/lib/prisma";
import { ayuMilanSchema } from "@/lib/zod";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type ApiEnvelope = {
  job_id?: string;
  status?: string;
};

const AYU_MILAN_API_URL =
  process.env.AYU_MILAN_API_URL ||
  "https://96apisoftware.96astro.com/96astro/api/v1/ayu-milan?sync=true";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.AYU_MILAN_API_TOKEN || process.env.LIFE_CALCULATOR_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Missing AYU_MILAN_API_TOKEN in environment." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const parsed = ayuMilanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid ayu milan payload.",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  let apiPayload;
  try {
    apiPayload = buildAyuMilanPayload(parsed.data);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid payload values.",
      },
      { status: 400 }
    );
  }

  const upstreamResponse = await fetch(AYU_MILAN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      reportType: process.env.AYU_MILAN_REPORT_TYPE || "full",
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
        error: "Ayu Milan API request failed.",
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
  const chunks = splitTextBySize(responseText || JSON.stringify(apiResponseJson ?? null), 250000);

  const created = await prisma.$transaction(async (tx) => {
    const report = await tx.ayuMilanReport.create({
      data: {
        userId: session.user.id,
        boyName: parsed.data.boyName,
        boyBirthDate: toBirthDateAtUtcMidnight(parsed.data.boyBirthDate),
        boyBirthTime: parsed.data.boyBirthTime,
        boyPlaceOfBirth: parsed.data.boyPlaceOfBirth,
        boyLatitudeDeg: apiPayload.boy_data.latitude_deg,
        boyLatitudeMin: apiPayload.boy_data.latitude_min,
        boyLatitudeDir: apiPayload.boy_data.latitude_dir,
        boyLongitudeDeg: apiPayload.boy_data.longitude_deg,
        boyLongitudeMin: apiPayload.boy_data.longitude_min,
        boyLongitudeDir: apiPayload.boy_data.longitude_dir,
        boyTimezone: apiPayload.boy_data.timezone,
        girlName: parsed.data.girlName,
        girlBirthDate: toBirthDateAtUtcMidnight(parsed.data.girlBirthDate),
        girlBirthTime: parsed.data.girlBirthTime,
        girlPlaceOfBirth: parsed.data.girlPlaceOfBirth,
        girlLatitudeDeg: apiPayload.girl_data.latitude_deg,
        girlLatitudeMin: apiPayload.girl_data.latitude_min,
        girlLatitudeDir: apiPayload.girl_data.latitude_dir,
        girlLongitudeDeg: apiPayload.girl_data.longitude_deg,
        girlLongitudeMin: apiPayload.girl_data.longitude_min,
        girlLongitudeDir: apiPayload.girl_data.longitude_dir,
        girlTimezone: apiPayload.girl_data.timezone,
        requestPayload: apiPayload as Prisma.InputJsonValue,
        responseJson: responsePreview,
        responseRaw: chunks.length === 1 ? chunks[0] : "",
        apiJobId: envelope.job_id ?? null,
        apiStatus: envelope.status ?? null,
      },
    });

    if (chunks.length > 1) {
      for (let index = 0; index < chunks.length; index += 1) {
        await tx.ayuMilanResponseChunk.create({
          data: {
            reportId: report.id,
            chunkIndex: index,
            data: chunks[index],
          },
        });
      }
    }

    return report;
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
