import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (filePath, folder) => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: "image",
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
    };
};

export const deleteImage = async (publicId) => {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
};