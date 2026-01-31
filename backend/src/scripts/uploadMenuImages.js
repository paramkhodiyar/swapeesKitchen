
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";


const IMAGES_DIR = path.join(process.cwd(), "images_menu");

async function uploadMenuImages() {
    const files = fs.readdirSync(IMAGES_DIR);
    console.log({
        cloud: process.env.CLOUDINARY_CLOUD_NAME,
        keyExists: !!process.env.CLOUDINARY_API_KEY,
        secretExists: !!process.env.CLOUDINARY_API_SECRET,
    });
    const results = [];

    for (const file of files) {
        const filePath = path.join(IMAGES_DIR, file);

        if (!fs.statSync(filePath).isFile()) continue;

        console.log(`⬆️ Uploading ${file}`);

        const res = await cloudinary.uploader.upload(filePath, {
            folder: "menu",
            resource_type: "image",
            use_filename: true,
            unique_filename: true,
        });

        results.push({
            file,
            slug: path.parse(file).name,
            url: res.secure_url,
            publicId: res.public_id,
        });
    }

    fs.writeFileSync(
        "menu-image-map.json",
        JSON.stringify(results, null, 2)
    );

    console.log("✅ All menu images uploaded");
}

uploadMenuImages().catch(console.error);
