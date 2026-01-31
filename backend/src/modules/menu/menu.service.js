import prisma from "../../config/prisma.js";

export async function createMenuItem(data) {
    return prisma.menuItem.create({
        data: {
            name: data.name,
            description: data.description,
            price: data.price,
            nutritionInfo: data.nutritionInfo,
            imageUrl: data.imageUrl,
            type: data.type || "FOOD",
            category: data.category
        },
    });
}

export async function updateMenuItem(id, data) {
    const item = await prisma.menuItem.findUnique({ where: { id } });

    if (!item || item.deletedAt) {
        throw new Error("Menu item not found");
    }

    return prisma.menuItem.update({
        where: { id },
        data: {
            name: data.name ?? item.name,
            description: data.description ?? item.description,
            price: data.price ?? item.price,
            nutritionInfo: data.nutritionInfo ?? item.nutritionInfo,
            imageUrl: data.imageUrl ?? item.imageUrl,
            isAvailable: data.isAvailable ?? item.isAvailable,
            isOutOfStock: data.isOutOfStock ?? item.isOutOfStock,
            type: data.type ?? item.type,
            category: data.category ?? item.category
        },
    });
}

export async function softDeleteMenuItem(id) {
    return prisma.menuItem.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            isAvailable: false,
        },
    });
}

export async function toggleOutOfStock(id, isOutOfStock) {
    return prisma.menuItem.update({
        where: { id },
        data: { isOutOfStock },
    });
}

export async function getPublicMenu(filters = {}) {
    const where = {
        deletedAt: null,
        isAvailable: true,
    };

    if (filters.type) {
        where.type = filters.type;
    }

    if (filters.category) {
        // Case-insensitive search ideally, but exact match for now is fine given generated list
        where.category = filters.category;
    }

    return prisma.menuItem.findMany({
        where,
        orderBy: [
            { isOutOfStock: "asc" }, // In-stock first
            { createdAt: "desc" }
        ]
    });
}

export async function getMenuItemById(id) {
    const item = await prisma.menuItem.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });

    if (!item) {
        throw new Error("Menu item not found");
    }

    return item;
}
