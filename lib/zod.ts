import { z } from "zod";

// Password Schema Base
const passwordField = z
  .string({ required_error: "Password is required" })
  .min(8, { message: "Password must be more than 8 characters" })
  .max(15, { message: "Password must be less than 15 characters" })
  .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
  .regex(/[0-9]/, { message: "Contain at least one number." })
  .regex(/[^a-zA-Z0-9]/, { message: "Contain at least one special character." })
  .trim();

// Email schema base
const emailField = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email!");

// Login Schema
export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

// Register Schema
export const registerSchema = loginSchema.extend({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .max(20, { message: "Phone number is too long." })
    .regex(/^[0-9+()\-\s]+$/, { message: "Invalid phone number format." }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: emailField,
});

// Create Password Schema
export const createPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string({
      required_error: "Confirm Password is required",
    }),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password does not match",
    path: ["confirmPassword"],
  });

export const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type FormSchemaType = z.infer<typeof formSchema>;

export const lifeCalculatorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
  }),
  placeOfBirth: z.string().min(1, "Place of Birth is required"),
  latitudeDeg: z.string().min(1, "Latitude degree is required"),
  latitudeMin: z.string().min(1, "Latitude minute is required"),
  latitudeDir: z.enum(["N", "S"], { required_error: "Latitude direction is required" }),
  longitudeDeg: z.string().min(1, "Longitude degree is required"),
  longitudeMin: z.string().min(1, "Longitude minute is required"),
  longitudeDir: z.enum(["E", "W"], { required_error: "Longitude direction is required" }),
  timezoneOffset: z.string().min(1, "Timezone is required"),
  chartStyle: z.enum(["North Indian", "South Indian"], {
    required_error: "Chart style is required",
  }),
  kpHoraryNumber: z
    .string()
    .min(1, "KP Horary Number is required")
    .regex(/^\d+$/, "KP Horary Number must be numeric"),
  birthDate: z.string().min(1, "Birth Date is required"),
  birthTime: z.string().min(1, "Birth Time is required"),
});

export type LifeCalculatorSchemaType = z.infer<typeof lifeCalculatorSchema>;

export const astroFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
  }),
  placeOfBirth: z.string().min(1, "Place of Birth is required"),
  latitudeDeg: z.string().min(1, "Latitude degree is required"),
  latitudeMin: z.string().min(1, "Latitude minute is required"),
  latitudeDir: z.enum(["N", "S"], { required_error: "Latitude direction is required" }),
  longitudeDeg: z.string().min(1, "Longitude degree is required"),
  longitudeMin: z.string().min(1, "Longitude minute is required"),
  longitudeDir: z.enum(["E", "W"], { required_error: "Longitude direction is required" }),
  timezoneOffset: z.string().min(1, "Timezone is required"),
  chartStyle: z.enum(["North Indian", "South Indian"], {
    required_error: "Chart style is required",
  }),
  kpHoraryNumber: z
    .string()
    .min(1, "KP Horary Number is required")
    .regex(/^\d+$/, "KP Horary Number must be numeric"),
  birthDate: z.string().min(1, "Birth Date is required"),
  birthTime: z.string().min(1, "Birth Time is required"),
});

export type AstroFormSchemaType = z.infer<typeof astroFormSchema>;

export const ayuMilanSchema = z.object({
  boyName: z.string().min(1, "Boy Name is required"),
  boyBirthDate: z.string().min(1, "Boy Birth Date is required"),
  boyBirthTime: z.string().min(1, "Boy Birth Time is required"),
  boyPlaceOfBirth: z.string().min(1, "Boy Place of Birth is required"),
  boyLatitudeDeg: z.string().min(1, "Boy Latitude degree is required"),
  boyLatitudeMin: z.string().min(1, "Boy Latitude minute is required"),
  boyLatitudeDir: z.enum(["N", "S"], { required_error: "Boy Latitude direction is required" }),
  boyLongitudeDeg: z.string().min(1, "Boy Longitude degree is required"),
  boyLongitudeMin: z.string().min(1, "Boy Longitude minute is required"),
  boyLongitudeDir: z.enum(["E", "W"], { required_error: "Boy Longitude direction is required" }),
  boyTimezoneOffset: z.string().min(1, "Boy Timezone is required"),
  boyChartStyle: z.enum(["North Indian", "South Indian"], {
    required_error: "Boy Chart style is required",
  }),
  boyKpHoraryNumber: z
    .string()
    .min(1, "Boy KP Horary Number is required")
    .regex(/^\d+$/, "Boy KP Horary Number must be numeric"),
  girlName: z.string().min(1, "Girl Name is required"),
  girlBirthDate: z.string().min(1, "Girl Birth Date is required"),
  girlBirthTime: z.string().min(1, "Girl Birth Time is required"),
  girlPlaceOfBirth: z.string().min(1, "Girl Place of Birth is required"),
  girlLatitudeDeg: z.string().min(1, "Girl Latitude degree is required"),
  girlLatitudeMin: z.string().min(1, "Girl Latitude minute is required"),
  girlLatitudeDir: z.enum(["N", "S"], { required_error: "Girl Latitude direction is required" }),
  girlLongitudeDeg: z.string().min(1, "Girl Longitude degree is required"),
  girlLongitudeMin: z.string().min(1, "Girl Longitude minute is required"),
  girlLongitudeDir: z.enum(["E", "W"], { required_error: "Girl Longitude direction is required" }),
  girlTimezoneOffset: z.string().min(1, "Girl Timezone is required"),
  girlChartStyle: z.enum(["North Indian", "South Indian"], {
    required_error: "Girl Chart style is required",
  }),
  girlKpHoraryNumber: z
    .string()
    .min(1, "Girl KP Horary Number is required")
    .regex(/^\d+$/, "Girl KP Horary Number must be numeric"),
});

export type AyuMilanSchemaType = z.infer<typeof ayuMilanSchema>;
