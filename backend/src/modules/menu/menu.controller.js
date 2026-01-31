import {
    createMenuItem,
    updateMenuItem,
    softDeleteMenuItem,
    toggleOutOfStock,
    getPublicMenu,
    getMenuItemById,
} from "./menu.service.js";


export async function createMenuItemController(req, res, next) {
    try {
        const item = await createMenuItem(req.body);
        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
}

export async function updateMenuItemController(req, res, next) {
    try {
        const item = await updateMenuItem(req.params.id, req.body);
        res.json(item);
    } catch (err) {
        next(err);
    }
}

export async function deleteMenuItemController(req, res, next) {
    try {
        await softDeleteMenuItem(req.params.id);
        res.json({ message: "Menu item deleted" });
    } catch (err) {
        next(err);
    }
}

export async function toggleStockController(req, res, next) {
    try {
        const { isOutOfStock } = req.body;
        const item = await toggleOutOfStock(req.params.id, isOutOfStock);
        res.json(item);
    } catch (err) {
        next(err);
    }
}



export async function getMenuController(req, res, next) {
    try {
        const { type, category } = req.query;
        const items = await getPublicMenu({ type, category });
        res.json(items);
    } catch (err) {
        next(err);
    }
}

export async function getMenuItemController(req, res, next) {
    try {
        const item = await getMenuItemById(req.params.id);
        res.json(item);
    } catch (err) {
        next(err);
    }
}
