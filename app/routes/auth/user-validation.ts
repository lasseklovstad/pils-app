import { z } from "zod";

export const PasswordSchema = z
  .string({ required_error: "Passord er påkrevd" })
  .min(6, { message: "Passord er for kort" })
  .max(100, { message: "Passord er for langt" });
export const NameSchema = z
  .string({ required_error: "Navn er påkrevd" })
  .min(3, { message: "Navn er for kort" })
  .max(40, { message: "Navn er for langt" });
export const EmailSchema = z
  .string({ required_error: "E-post er påkrevd" })
  .email({ message: "E-post er ugyldig" })
  .min(3, { message: "E-post er for kort" })
  .max(100, { message: "E-post er for lang" })
  // users can type the email in any case, but we store it in lowercase
  .transform((value) => value.toLowerCase());

export const PasswordAndConfirmPasswordSchema = z
  .object({ password: PasswordSchema, confirmPassword: PasswordSchema })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "Passordene må være like",
      });
    }
  });
