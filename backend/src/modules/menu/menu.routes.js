import {
    createMenuItemController,
    updateMenuItemController,
    deleteMenuItemController,
    toggleStockController,
    getMenuController,
    getMenuItemController,
} from "./menu.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import { Router } from "express";

const router = Router();

// OWNER ONLY
router.post(
    "/",
    authMiddleware,
    roleMiddleware("OWNER"),
    createMenuItemController
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("OWNER"),
    updateMenuItemController
);

router.patch(
    "/:id/stock",
    authMiddleware,
    roleMiddleware("OWNER"),
    toggleStockController
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("OWNER"),
    deleteMenuItemController
);

// PUBLIC
router.get("/", getMenuController);
router.get("/:id", getMenuItemController);

export default router;