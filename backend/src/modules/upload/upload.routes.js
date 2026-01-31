import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../../utils/cloudinaryUpload.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import fs from "fs/promises";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/",
    authMiddleware,
    roleMiddleware("OWNER"),
    upload.array("images", 5),
    async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: "No files uploaded" });
            }

            const results = [];
            for (const file of req.files) {
                const result = await uploadImage(file.path, "menu-items");
                results.push(result);
                // Delete temp file
                await fs.unlink(file.path);
            }

            return res.status(200).json({
                message: "Images uploaded successfully",
                data: results
            });
        } catch (error) {
            console.error("Upload error:", error);
            return res.status(500).json({ message: "Upload failed" });
        }
    }
);

export default router;
