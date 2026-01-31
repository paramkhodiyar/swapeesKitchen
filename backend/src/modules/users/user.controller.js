import {
    getMe,
    updateProfile,
    listUsers,
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    addSavedPayment,
    getSavedPayments,
    deleteSavedPayment,
} from "./user.service.js";

export async function getMeController(req, res, next) {
    try {
        const user = await getMe(req.user.id);
        res.json(user);
    } catch (err) {
        next(err);
    }
}

export async function updateProfileController(req, res, next) {
    try {
        const user = await updateProfile(req.user.id, req.body);
        res.json(user);
    } catch (err) {
        next(err);
    }
}

export async function listUsersController(req, res, next) {
    try {
        const users = await listUsers();
        res.json(users);
    } catch (err) {
        next(err);
    }
}

export async function addAddressController(req, res, next) {
    try {
        const { street, city, state, zip, isDefault } = req.body;

        if (!street || !city || !state || !zip) {
            return res.status(400).json({ message: "All address fields are required" });
        }

        const address = await addAddress(req.user.id, {
            street,
            city,
            state,
            zip,
            isDefault: isDefault || false,
        });

        res.status(201).json(address);
    } catch (err) {
        next(err);
    }
}

export async function getAddressesController(req, res, next) {
    try {
        const addresses = await getAddresses(req.user.id);
        res.json(addresses);
    } catch (err) {
        next(err);
    }
}

export async function deleteAddressController(req, res, next) {
    try {
        await deleteAddress(req.user.id, req.params.id);
        res.json({ message: "Address deleted" });
    } catch (err) {
        next(err);
    }
}

export async function updateAddressController(req, res, next) {
    try {
        const address = await updateAddress(req.user.id, req.params.id, req.body);
        res.json(address);
    } catch (err) {
        next(err);
    }
}

// ---------------- SAVED PAYMENTS ----------------

export async function addSavedPaymentController(req, res, next) {
    try {
        const { type, provider, identifier, isDefault } = req.body;
        if (!type || !provider || !identifier) {
            return res.status(400).json({ message: "Type, provider and identifier are required" });
        }

        const payment = await addSavedPayment(req.user.id, {
            type,
            provider,
            identifier,
            isDefault: isDefault || false
        });

        res.status(201).json(payment);
    } catch (err) {
        next(err);
    }
}

export async function getSavedPaymentsController(req, res, next) {
    try {
        const payments = await getSavedPayments(req.user.id);
        res.json(payments);
    } catch (err) {
        next(err);
    }
}

export async function deleteSavedPaymentController(req, res, next) {
    try {
        await deleteSavedPayment(req.user.id, req.params.id);
        res.json({ message: "Saved payment deleted" });
    } catch (err) {
        next(err);
    }
}
