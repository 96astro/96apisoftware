import { AyuMilanSchemaType } from "@/lib/zod";

type BirthParts = {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  second: number;
};

type PersonPayload = {
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

export type AyuMilanApiPayload = {
  boy_data: PersonPayload;
  girl_data: PersonPayload;
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

function parseBirthParts(birthDate: string, birthTime: string, prefix: string): BirthParts {
  const [yearRaw, monthRaw, dayRaw] = birthDate.split("-");
  const [hourRaw, minuteRaw, secondRaw] = birthTime.split(":");

  return {
    day: parseInteger(dayRaw, `${prefix} day`),
    month: parseInteger(monthRaw, `${prefix} month`),
    year: parseInteger(yearRaw, `${prefix} year`),
    hour: parseInteger(hourRaw, `${prefix} hour`),
    minute: parseInteger(minuteRaw, `${prefix} minute`),
    second: secondRaw ? parseInteger(secondRaw, `${prefix} second`) : 0,
  };
}

function toPersonPayload(input: {
  name: string;
  birthDate: string;
  birthTime: string;
  latitudeDeg: string;
  latitudeMin: string;
  latitudeDir: "N" | "S";
  longitudeDeg: string;
  longitudeMin: string;
  longitudeDir: "E" | "W";
  timezoneOffset: string;
  gender: string;
  chartStyle: string;
  kpHoraryNumber: number;
  prefix: string;
}): PersonPayload {
  const birth = parseBirthParts(input.birthDate, input.birthTime, input.prefix);

  return {
    name: input.name,
    gender: input.gender,
    day: birth.day,
    month: birth.month,
    year: birth.year,
    hour: birth.hour,
    minute: birth.minute,
    second: birth.second,
    longitude_deg: parseInteger(input.longitudeDeg, `${input.prefix} longitude degree`),
    longitude_min: parseInteger(input.longitudeMin, `${input.prefix} longitude minute`),
    longitude_dir: input.longitudeDir,
    latitude_deg: parseInteger(input.latitudeDeg, `${input.prefix} latitude degree`),
    latitude_min: parseInteger(input.latitudeMin, `${input.prefix} latitude minute`),
    latitude_dir: input.latitudeDir,
    timezone: parseDecimal(input.timezoneOffset, `${input.prefix} timezone`),
    chart_style: input.chartStyle,
    kp_horary_number: input.kpHoraryNumber,
  };
}

export function buildAyuMilanPayload(values: AyuMilanSchemaType): AyuMilanApiPayload {
  const chartStyle = process.env.AYU_MILAN_CHART_STYLE || "North Indian";
  const kpHorary = Number.parseInt(process.env.AYU_MILAN_KP_HORARY_NUMBER || "0", 10);

  return {
    boy_data: toPersonPayload({
      name: values.boyName,
      birthDate: values.boyBirthDate,
      birthTime: values.boyBirthTime,
      latitudeDeg: values.boyLatitudeDeg,
      latitudeMin: values.boyLatitudeMin,
      latitudeDir: values.boyLatitudeDir,
      longitudeDeg: values.boyLongitudeDeg,
      longitudeMin: values.boyLongitudeMin,
      longitudeDir: values.boyLongitudeDir,
      timezoneOffset: values.boyTimezoneOffset,
      gender: process.env.AYU_MILAN_BOY_GENDER || "Male",
      chartStyle,
      kpHoraryNumber: Number.isNaN(kpHorary) ? 0 : kpHorary,
      prefix: "Boy",
    }),
    girl_data: toPersonPayload({
      name: values.girlName,
      birthDate: values.girlBirthDate,
      birthTime: values.girlBirthTime,
      latitudeDeg: values.girlLatitudeDeg,
      latitudeMin: values.girlLatitudeMin,
      latitudeDir: values.girlLatitudeDir,
      longitudeDeg: values.girlLongitudeDeg,
      longitudeMin: values.girlLongitudeMin,
      longitudeDir: values.girlLongitudeDir,
      timezoneOffset: values.girlTimezoneOffset,
      gender: process.env.AYU_MILAN_GIRL_GENDER || "Female",
      chartStyle,
      kpHoraryNumber: Number.isNaN(kpHorary) ? 0 : kpHorary,
      prefix: "Girl",
    }),
  };
}

export function toBirthDateAtUtcMidnight(birthDate: string): Date {
  return new Date(`${birthDate}T00:00:00.000Z`);
}
