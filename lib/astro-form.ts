import { AstroFormSchemaType } from "@/lib/zod";

export type AstroFormApiPayload = {
  name: string;
  gender: string;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  second: number;
  longitude_deg: number;
  longitude_min: number;
  longitude_dir: "E" | "W";
  latitude_deg: number;
  latitude_min: number;
  latitude_dir: "N" | "S";
  timezone: number;
  chart_style: string;
  kp_horary_number: number;
};

type ParsedBirthParts = {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  second: number;
};

function parseInteger(value: string, fieldLabel: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`${fieldLabel} must be a valid number.`);
  }
  return parsed;
}

function parseDecimal(value: string, fieldLabel: string): number {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${fieldLabel} must be a valid number.`);
  }
  return parsed;
}

function parseBirthParts(birthDate: string, birthTime: string): ParsedBirthParts {
  const [yearRaw, monthRaw, dayRaw] = birthDate.split("-");
  const [hourRaw, minuteRaw, secondRaw] = birthTime.split(":");

  const year = parseInteger(yearRaw, "Birth year");
  const month = parseInteger(monthRaw, "Birth month");
  const day = parseInteger(dayRaw, "Birth day");
  const hour = parseInteger(hourRaw, "Birth hour");
  const minute = parseInteger(minuteRaw, "Birth minute");
  const second = secondRaw ? parseInteger(secondRaw, "Birth second") : 0;

  return { day, month, year, hour, minute, second };
}

function toApiGender(gender: AstroFormSchemaType["gender"]): string {
  if (gender === "male") return "Male";
  if (gender === "female") return "Female";
  return "Other";
}

export function buildAstroFormPayload(values: AstroFormSchemaType): AstroFormApiPayload {
  const birth = parseBirthParts(values.birthDate, values.birthTime);
  const kpHoraryNumber = Number.parseInt(values.kpHoraryNumber, 10);

  return {
    name: values.name,
    gender: toApiGender(values.gender),
    day: birth.day,
    month: birth.month,
    year: birth.year,
    hour: birth.hour,
    minute: birth.minute,
    second: birth.second,
    longitude_deg: parseInteger(values.longitudeDeg, "Longitude degree"),
    longitude_min: parseInteger(values.longitudeMin, "Longitude minute"),
    longitude_dir: values.longitudeDir,
    latitude_deg: parseInteger(values.latitudeDeg, "Latitude degree"),
    latitude_min: parseInteger(values.latitudeMin, "Latitude minute"),
    latitude_dir: values.latitudeDir,
    timezone: parseDecimal(values.timezoneOffset, "Timezone offset"),
    chart_style: values.chartStyle,
    kp_horary_number: Number.isNaN(kpHoraryNumber) ? 145 : kpHoraryNumber,
  };
}

export function toBirthDateAtUtcMidnight(birthDate: string): Date {
  return new Date(`${birthDate}T00:00:00.000Z`);
}
