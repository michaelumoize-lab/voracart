// app/api/seller-application/admin/review/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyApplicantOfDecision } from "@/lib/notifications";
import { getServerSession } from "@/lib/get-session";

const reviewSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Admin access required", 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON", 400);
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues.map((e) => e.message).join(", "), 400);
  }

  const { applicationId, status } = parsed.data;

  try {
    const application = await prisma.sellerApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: application.userId },
        data: {
          role: "seller",
        },
      });
    }

    notifyApplicantOfDecision(application.userId, status === "APPROVED").catch(
      (error) => {
        console.error("[Non-critical] Applicant notification failed:", error);
      },
    );

    return apiSuccess({ application });
  } catch (err) {
    console.error("Review application error:", err);
    return apiError("Failed to review application", 500);
  }
}