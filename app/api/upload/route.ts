import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-helper";
import { uploadImages } from "@/lib/cloudinary";
import { getServerSession } from "@/lib/get-session";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  // Only sellers and admins can upload
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return apiError("Only sellers can upload images", 403);
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return apiError("No images provided", 400);
    }

    if (files.length > 4) {
      return apiError("Maximum 4 images allowed", 400);
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const invalidFile = files.find((file) => !allowedTypes.includes(file.type));
    if (invalidFile) {
      return apiError("Only JPEG, PNG, and WEBP images are allowed", 400);
    }

    // Validate file size (max 5MB each)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const oversizedFile = files.find((file) => file.size > MAX_SIZE);
    if (oversizedFile) {
      return apiError("Each image must be less than 5MB", 400);
    }

    // Convert files to base64
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      return base64;
    });

    const base64Files = await Promise.all(uploadPromises);
    const imageUrls = await uploadImages(base64Files, "voracart/products");

    return apiSuccess({ urls: imageUrls }, 201);
  } catch (error) {
    console.error("Upload error:", error);
    return apiError("Failed to upload images", 500);
  }
}