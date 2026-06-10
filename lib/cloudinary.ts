// lib/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload a single image and return the secure URL
export const uploadImage = async (
  file: string,
  folder: string = "voracart",
): Promise<string> => {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
  });
  return result.secure_url;
};

export const uploadImages = async (
  files: string[],
  folder: string = "voracart",
): Promise<string[]> => {
  const uploads = await Promise.all(
    files.map((file) => uploadImage(file, folder)),
  );
  return uploads;
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!publicId) {
    console.error("No publicId provided for deletion");
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete image:", error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/subfolder/image.jpg
 * Returns: folder/subfolder/image
 */
export const getPublicId = (url: string): string => {
  if (!url) return "";
  
  try {
    // Parse the URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Find "/upload/" in the path and get everything after it
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) {
      console.error("Invalid Cloudinary URL: missing '/upload/' segment");
      return "";
    }
    
    // Get the part after "/upload/"
    let publicIdWithVersion = pathname.substring(uploadIndex + 8); // 8 is length of "/upload/"
    
    // Remove version prefix if present (e.g., "v1234567890/")
    const versionMatch = publicIdWithVersion.match(/^v\d+\//);
    if (versionMatch) {
      publicIdWithVersion = publicIdWithVersion.substring(versionMatch[0].length);
    }
    
    // Remove file extension (e.g., ".jpg", ".png", ".webp")
    const lastDotIndex = publicIdWithVersion.lastIndexOf(".");
    const publicId = lastDotIndex !== -1 
      ? publicIdWithVersion.substring(0, lastDotIndex)
      : publicIdWithVersion;
    
    return publicId;
  } catch (error) {
    console.error("Failed to parse Cloudinary URL:", error);
    return "";
  }
};

// Get public ID from uploaded result object (type-safe)
export const getPublicIdFromUploadResult = (result: UploadApiResponse): string => {
  return result.public_id;
};