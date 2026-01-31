import {
    placeOrderController,
    cancelOrderController,
    acceptOrderController,
    rejectOrderController,
    getMyOrdersController,
    getAllOrdersController,
    getAnalyticsController,
    deliveredOrderController,
    payOrderController
} from "./order.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import { Router } from "express";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("CUSTOMER"),
    placeOrderController
);

router.put(
    "/:id/cancel",
    authMiddleware,
    roleMiddleware("CUSTOMER"),
    cancelOrderController
);

router.put(
    "/:id/accept",
    authMiddleware,
    roleMiddleware("OWNER"),
    acceptOrderController
);

router.put(
    "/:id/reject",
    authMiddleware,
    roleMiddleware("OWNER"),
    rejectOrderController
);

router.get(
    "/my-orders",
    authMiddleware,
    roleMiddleware("CUSTOMER"),
    getMyOrdersController
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("OWNER"),
    getAllOrdersController
);

router.get(
    "/analytics",
    authMiddleware,
    roleMiddleware("OWNER"),
    getAnalyticsController
);

router.put(
    "/:id/delivered",
    authMiddleware,
    roleMiddleware("OWNER"),
    deliveredOrderController
);

router.put(
    "/:id/pay",
    authMiddleware,
    payOrderController
);

export default router;