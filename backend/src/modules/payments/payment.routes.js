import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";

import {
    requestPaymentController,
    paymentWebhookController,
} from "./payment.controller.js";

const router = Router();

// CUSTOMER – initiate payment after acceptance
router.post(
    "/:orderId/request",
    authMiddleware,
    requestPaymentController
);

// PAYMENT GATEWAY WEBHOOK
router.post("/webhook", paymentWebhookController);

export default router;
