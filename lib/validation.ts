import { z } from "zod";

// ─── Password Schema ──────────────────────────────────────────────────────────
// Customize rules to match your security requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .refine(
    (value) => value.trim().length > 0,
    "Password cannot be only whitespace",
  );
// .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
// .regex(/[a-z]/, "Password must contain at least one lowercase letter")
// .regex(/[0-9]/, "Password must contain at least one number")
// .regex(
//   /[^A-Za-z0-9]/,
//   "Password must contain at least one special character",
// );
