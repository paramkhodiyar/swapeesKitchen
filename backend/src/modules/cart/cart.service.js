import prisma from "../../config/prisma.js";


export async function addToCart(userId, menuItemId, quantity) {
    const item = await prisma.menuItem.findFirst({
        where: {
            id: menuItemId,
            deletedAt: null,
            isAvailable: true,
            isOutOfStock: false,
        },
    });

    if (!item) {
        throw new Error("Item not available");
    }

    const existing = await prisma.cartItem.findUnique({
        where: {
            userId_menuItemId: {
                userId,
                menuItemId,
            },
        },
    });

    if (existing) {
        return prisma.cartItem.update({
            where: { id: existing.id },
            data: {
                quantity: existing.quantity + quantity,
            },
        });
    }

    return prisma.cartItem.create({
        data: {
            userId,
            menuItemId,
            quantity,
            priceSnapshot: item.price,
        },
    });
}


export async function getCart(userId) {
    return prisma.cartItem.findMany({
        where: { userId },
        include: {
            menuItem: true,
        },
    });
}



export async function updateCartItem(userId, cartItemId, quantity) {
    if (quantity <= 0) {
        return prisma.cartItem.delete({
            where: { id: cartItemId },
        });
    }

    return prisma.cartItem.updateMany({
        where: {
            id: cartItemId,
            userId,
        },
        data: { quantity },
    });
}



export async function removeCartItem(userId, cartItemId) {
    return prisma.cartItem.deleteMany({
        where: {
            id: cartItemId,
            userId,
        },
    });
}


export async function clearCart(userId) {
    return prisma.cartItem.deleteMany({
        where: { userId },
    });
}
