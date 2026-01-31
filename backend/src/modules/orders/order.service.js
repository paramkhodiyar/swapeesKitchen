import prisma from "../../config/prisma.js";
import { canTransition } from "./order.state.js";

export async function createOrderFromCart(userId, deliveryAddress, customerNote) {
    const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { menuItem: true },
    });

    if (!cartItems.length) {
        throw new Error("Cart is empty");
    }

    // Check for Fruits and 11 PM restriction
    const hasFruits = cartItems.some(item => item.menuItem.type === "FRUIT");
    if (hasFruits) {
        const now = new Date();
        const hours = now.getHours();
        if (hours >= 23) {
            throw new Error("FRUIT_BOOKING_LOCKED");
        }
    }

    // Split cart items by type
    const itemsByType = cartItems.reduce((acc, item) => {
        const type = item.menuItem.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
    }, {});

    const createdOrders = [];

    return prisma.$transaction(async (tx) => {
        for (const [type, items] of Object.entries(itemsByType)) {
            let total = 0;
            const orderItemsData = items.map((item) => {
                const subtotal = Number(item.priceSnapshot) * item.quantity;
                total += subtotal;
                return {
                    menuItemId: item.menuItemId,
                    itemNameSnapshot: item.menuItem.name,
                    priceSnapshot: item.priceSnapshot,
                    nutritionSnapshot: item.menuItem.nutritionInfo,
                    quantity: item.quantity,
                    subtotal,
                };
            });

            // Logic: 
            // FRUIT -> ACCEPTED, PAYMENT_PENDING
            // FOOD -> PENDING_ACCEPTANCE, NOT_REQUESTED
            const status = type === "FRUIT" ? "ACCEPTED" : "PENDING_ACCEPTANCE";
            const paymentStatus = type === "FRUIT" ? "PAYMENT_PENDING" : "NOT_REQUESTED";

            const order = await tx.order.create({
                data: {
                    orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    userId,
                    status,
                    paymentStatus,
                    totalAmount: total,
                    deliveryAddress,
                    customerNote,
                    items: { create: orderItemsData },
                },
            });

            await tx.orderStatusHistory.create({
                data: {
                    orderId: order.id,
                    newStatus: status,
                    changedBy: "CUSTOMER",
                },
            });

            createdOrders.push(order);
        }

        await tx.cartItem.deleteMany({ where: { userId } });
        return createdOrders;
    });
}

export async function updateOrderStatus(orderId, nextStatus, actor) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");

    if (!canTransition(order.status, nextStatus, actor)) {
        throw new Error("Invalid order state transition");
    }

    const data = { status: nextStatus };

    // When owner accepts a FOOD order, it moves to PAYMENT_PENDING
    if (nextStatus === "ACCEPTED") {
        data.paymentStatus = "PAYMENT_PENDING";
        data.acceptedAt = new Date();
    }

    return prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
            where: { id: orderId },
            data,
        });

        await tx.orderStatusHistory.create({
            data: {
                orderId,
                previousStatus: order.status,
                newStatus: nextStatus,
                changedBy: actor,
            },
        });

        return updated;
    });
}

export async function payOrder(orderId, paymentMethod) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");

    if (order.status.includes("CANCELLED") || order.paymentStatus === "PAID") {
        throw new Error("Cannot pay for this order");
    }

    return prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: "PAID",
                paidAt: new Date(),
            },
        });

        await tx.payment.create({
            data: {
                orderId,
                gateway: paymentMethod,
                gatewayPaymentId: `MOCK-${Date.now()}`,
                amount: order.totalAmount,
                result: 'SUCCESS'
            }
        });

        return updated;
    });
}

export async function getCustomerOrders(userId) {
    return prisma.order.findMany({
        where: { userId },
        include: { items: { include: { menuItem: true } } },
        orderBy: { createdAt: "desc" },
    });
}

export async function getAllOrders() {
    return prisma.order.findMany({
        include: { items: { include: { menuItem: true } }, user: true },
        orderBy: { createdAt: "desc" },
    });
}
