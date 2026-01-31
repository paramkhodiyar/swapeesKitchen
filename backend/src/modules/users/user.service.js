import prisma from "../../config/prisma.js";

// ---------------- CURRENT USER ----------------

export async function getMe(userId) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });
}

// ---------------- UPDATE PROFILE ----------------

export async function updateProfile(userId, data) {
    // Only allow name and email updates
    return prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            email: data.email,
        },
    });
}

// ---------------- OWNER: LIST USERS ----------------

export async function listUsers() {
    return prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { orders: true },
            },
        },
    });
}

// ---------------- ADDRESS MANAGEMENT ----------------

export async function addAddress(userId, addressData) {
    // If setting as default, unset others first
    if (addressData.isDefault) {
        await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
        });
    }

    return prisma.address.create({
        data: {
            userId,
            ...addressData,
        },
    });
}

export async function getAddresses(userId) {
    return prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
}

export async function updateAddress(userId, addressId, data) {
    // If setting as default, unset others first
    if (data.isDefault) {
        await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
        });
    }

    return prisma.address.update({
        where: { id: addressId, userId },
        data,
    });
}

export async function deleteAddress(userId, addressId) {
    // Ensure user owns address
    const address = await prisma.address.findFirst({
        where: { id: addressId, userId },
    });

    if (!address) {
        throw new Error("Address not found or unauthorized");
    }

    return prisma.address.delete({
        where: { id: addressId },
    });
}

// ---------------- SAVED PAYMENTS ----------------

export async function addSavedPayment(userId, paymentData) {
    if (paymentData.isDefault) {
        await prisma.savedPayment.updateMany({
            where: { userId },
            data: { isDefault: false },
        });
    }

    return prisma.savedPayment.create({
        data: {
            userId,
            ...paymentData,
        },
    });
}

export async function getSavedPayments(userId) {
    return prisma.savedPayment.findMany({
        where: { userId },
        orderBy: { isDefault: "desc" },
    });
}

export async function deleteSavedPayment(userId, paymentId) {
    return prisma.savedPayment.delete({
        where: { id: paymentId, userId },
    });
}
