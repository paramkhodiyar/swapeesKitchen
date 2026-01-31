import {
    addToCartController,
    getCartController,
    updateCartItemController,
    removeCartItemController,
} from "./cart.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import { Router } from "express";
const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("CUSTOMER"),
    addToCartController
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("CUSTOMER"),
    getCartController
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("CUSTOMER"),
    updateCartItemController
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("CUSTOMER"),
    removeCartItemController
);

export default router;