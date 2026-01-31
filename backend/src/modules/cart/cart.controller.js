import {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
} from "./cart.service.js";

export async function addToCartController(req, res, next) {
    try {
        const { menuItemId, quantity } = req.body;

        if (!menuItemId || !quantity) {
            return res
                .status(400)
                .json({ message: "menuItemId and quantity are required" });
        }

        const item = await addToCart(
            req.user.id,
            menuItemId,
            quantity
        );

        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
}

export async function getCartController(req, res, next) {
    try {
        const cart = await getCart(req.user.id);
        res.json(cart);
    } catch (err) {
        next(err);
    }
}

export async function updateCartItemController(req, res, next) {
    try {
        const { quantity } = req.body;

        if (quantity === undefined) {
            return res
                .status(400)
                .json({ message: "quantity is required" });
        }

        await updateCartItem(
            req.user.id,
            req.params.id,
            quantity
        );

        res.json({ message: "Cart updated" });
    } catch (err) {
        next(err);
    }
}

export async function removeCartItemController(req, res, next) {
    try {
        await removeCartItem(req.user.id, req.params.id);
        res.json({ message: "Item removed" });
    } catch (err) {
        next(err);
    }
}
