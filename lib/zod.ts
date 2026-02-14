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
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  timezone: z.string().min(1, "Timezone is required"),
  birthDate: z.string().min(1, "Birth Date is required"),
  birthTime: z.string().min(1, "Birth Time is required"),
});

export type LifeCalculatorSchemaType = z.infer<typeof lifeCalculatorSchema>;

export const ayuMilanSchema = z.object({
  boyName: z.string().min(1, "Boy Name is required"),
  boyBirthDate: z.string().min(1, "Boy Birth Date is required"),
  boyBirthTime: z.string().min(1, "Boy Birth Time is required"),
  boyPlaceOfBirth: z.string().min(1, "Boy Place of Birth is required"),
  boyLatitude: z.string().min(1, "Boy Latitude is required"),
  boyLongitude: z.string().min(1, "Boy Longitude is required"),
  boyTimezone: z.string().min(1, "Boy Timezone is required"),
  girlName: z.string().min(1, "Girl Name is required"),
  girlBirthDate: z.string().min(1, "Girl Birth Date is required"),
  girlBirthTime: z.string().min(1, "Girl Birth Time is required"),
  girlPlaceOfBirth: z.string().min(1, "Girl Place of Birth is required"),
  girlLatitude: z.string().min(1, "Girl Latitude is required"),
  girlLongitude: z.string().min(1, "Girl Longitude is required"),
  girlTimezone: z.string().min(1, "Girl Timezone is required"),
});

export type AyuMilanSchemaType = z.infer<typeof ayuMilanSchema>;
