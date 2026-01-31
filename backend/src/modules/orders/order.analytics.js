import prisma from "../../config/prisma.js";

// ---------------- DATE HELPERS ----------------

function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

function startOfWeek() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function startOfMonth() {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

// ---------------- ANALYTICS SERVICES ----------------

export async function getOrderCountTrend() {
    return {
        today: await prisma.order.count({
            where: { createdAt: { gte: startOfToday() } },
        }),
        week: await prisma.order.count({
            where: { createdAt: { gte: startOfWeek() } },
        }),
        month: await prisma.order.count({
            where: { createdAt: { gte: startOfMonth() } },
        }),
    };
}

export async function getRevenueTrend() {
    const today = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "PAID", paidAt: { gte: startOfToday() } },
    });
    const week = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "PAID", paidAt: { gte: startOfWeek() } },
    });
    const month = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "PAID", paidAt: { gte: startOfMonth() } },
    });

    return {
        today: today._sum.totalAmount || 0,
        week: week._sum.totalAmount || 0,
        month: month._sum.totalAmount || 0,
    };
}

export async function getMostOrderedItems(limit = 5) {
    const items = await prisma.orderItem.groupBy({
        by: ["itemNameSnapshot"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: limit,
    });
    return items.map(i => ({ name: i.itemNameSnapshot, count: i._sum.quantity }));
}

export async function getCategoryPerformance() {
    const performance = await prisma.orderItem.findMany({
        include: { menuItem: true },
        where: { order: { paymentStatus: "PAID" } }
    });

    const categories = {};
    performance.forEach(item => {
        const cat = item.menuItem?.category || "General";
        categories[cat] = (categories[cat] || 0) + Number(item.subtotal);
    });

    return Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}

export async function getTopRevenueItems(limit = 5) {
    const items = await prisma.orderItem.groupBy({
        by: ["itemNameSnapshot"],
        _sum: { subtotal: true },
        where: { order: { paymentStatus: "PAID" } },
        orderBy: { _sum: { subtotal: "desc" } },
        take: limit,
    });
    return items.map(i => ({ name: i.itemNameSnapshot, revenue: Number(i._sum.subtotal) }));
}

export async function getDailyRevenueLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        dates.push(d);
    }

    const revenue = await Promise.all(dates.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const result = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                paymentStatus: "PAID",
                paidAt: { gte: date, lt: nextDay }
            }
        });

        return {
            date: date.toLocaleDateString(undefined, { weekday: 'short' }),
            amount: Number(result._sum.totalAmount || 0)
        };
    }));

    return revenue;
}

export async function getCancellationStats() {
    const stats = await prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
        where: {
            status: { in: ["CANCELLED_BY_OWNER", "CANCELLED_BY_CUSTOMER"] },
        },
    });
    return stats.map(s => ({ status: s.status, count: s._count.status }));
}
