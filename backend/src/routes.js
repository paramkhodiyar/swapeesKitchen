import { Router } from "express";

import authRoutes from "./modules/auth/auth.routes.js";
import menuRoutes from "./modules/menu/menu.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";


const router = Router();

router.use("/auth", authRoutes);
router.use("/menu", menuRoutes);
router.use("/cart", cartRoutes);
router.use("/users", userRoutes);
router.use("/payments", paymentRoutes);
router.use("/orders", orderRoutes);
router.use("/upload", uploadRoutes);

export default router;
