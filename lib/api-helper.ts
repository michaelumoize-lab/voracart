// lib/api-helper.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

export const apiError = (message: string, status: number = 400) => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
};

export const apiSuccess = (
  data: Record<string, unknown> = {},
  status: number = 200,
) => {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status },
  );
};

export const validateBody = async <T>(
  req: NextRequest,
  schema: ZodSchema<T>,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> => {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.issues.map((e) => e.message).join(", ");
      return { data: null, error: apiError(message, 400) };
    }
    return { data: null, error: apiError("Invalid request body", 400) };
  }
};

// Optional: Simple rate limiting without Arcjet
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export const checkRateLimit = (
  ip: string,
  limit: number = 10,
  windowMs: number = 60000,
) => {
  const now = Date.now();

  // Lazy cleanup of expired records to avoid timers in serverless environments
  for (const [key, record] of rateLimitMap) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { blocked: false };
  }

  if (now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { blocked: false };
  }

  if (record.count >= limit) {
    return { blocked: true };
  }

  record.count++;
  return { blocked: false };
};
