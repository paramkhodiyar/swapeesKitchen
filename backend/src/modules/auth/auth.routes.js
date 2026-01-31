import { Router } from "express";
import {
    requestOtpController,
    verifyOtpController,
    passwordLoginController,
    registerUserController,
    meController,
} from "./auth.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/otp/request", requestOtpController);
router.post("/otp/verify", verifyOtpController);
router.post("/login", passwordLoginController);
router.post("/register", registerUserController);
router.get("/me", authMiddleware, meController);

export default router;
