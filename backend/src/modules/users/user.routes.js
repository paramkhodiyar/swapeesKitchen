import {
    getMeController,
    updateProfileController,
    listUsersController,
    addAddressController,
    getAddressesController,
    updateAddressController,
    deleteAddressController,
    addSavedPaymentController,
    getSavedPaymentsController,
    deleteSavedPaymentController,
} from "./user.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import { Router } from "express";

const router = Router();

router.get(
    "/me",
    authMiddleware,
    getMeController
);

router.put(
    "/me",
    authMiddleware,
    updateProfileController
);

router.post(
    "/addresses",
    authMiddleware,
    addAddressController
);

router.get(
    "/addresses",
    authMiddleware,
    getAddressesController
);

router.put(
    "/addresses/:id",
    authMiddleware,
    updateAddressController
);

router.delete(
    "/addresses/:id",
    authMiddleware,
    deleteAddressController
);

router.post(
    "/payments",
    authMiddleware,
    addSavedPaymentController
);

router.get(
    "/payments",
    authMiddleware,
    getSavedPaymentsController
);

router.delete(
    "/payments/:id",
    authMiddleware,
    deleteSavedPaymentController
);


router.get(
    "/",
    authMiddleware,
    roleMiddleware("OWNER"),
    listUsersController
);

export default router;