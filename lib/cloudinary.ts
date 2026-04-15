import { v2 as cloudinary } from "cloudinary";

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
  await cloudinary.uploader.destroy(publicId);
};
export const getPublicId = (url: string): string => {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0];
};
