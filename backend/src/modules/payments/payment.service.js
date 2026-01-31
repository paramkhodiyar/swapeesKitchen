import prisma from "../../config/prisma.js";

// ---------------- REQUEST PAYMENT ----------------

export async function requestPayment(orderId, userId) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
        throw new Error("Order not found");
    }

    if (order.paymentStatus !== "PAYMENT_PENDING") {
        throw new Error("Payment not allowed for this order");
    }

    // In real gateway integration:
    // create payment intent here

    return {
        orderId: order.id,
        amount: order.totalAmount,
        currency: "INR",
    };
}

// ---------------- CONFIRM PAYMENT (WEBHOOK) ----------------

export async function confirmPayment({
    orderId,
    gateway,
    gatewayPaymentId,
    amount,
    success,
    rawResponse,
}) {
    return prisma.$transaction(async (tx) => {
        await tx.payment.create({
            data: {
                orderId,
                gateway,
                gatewayPaymentId,
                amount,
                result: success ? "SUCCESS" : "FAILED",
                rawResponse,
            },
        });

        if (success) {
            await tx.order.update({
                where: { id: orderId },
                data: {
                    paymentStatus: "PAID",
                    paidAt: new Date(),
                },
            });
        }
    });
}
