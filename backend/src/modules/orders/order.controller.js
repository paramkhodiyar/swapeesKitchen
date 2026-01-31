import {
    createOrderFromCart,
    updateOrderStatus,
    getCustomerOrders,
    getAllOrders,
    payOrder,
} from "./order.service.js";
import * as analytics from "./order.analytics.js";

export async function payOrderController(req, res, next) {
    try {
        const { method } = req.body;
        const order = await payOrder(req.params.id, method);
        res.json(order);
    } catch (err) {
        next(err);
    }
}

export async function placeOrderController(req, res, next) {
    try {
        const { deliveryAddress, customerNote } = req.body;

        if (!deliveryAddress) {
            return res.status(400).json({ message: "Delivery address required" });
        }

        const order = await createOrderFromCart(
            req.user.id,
            deliveryAddress,
            customerNote
        );

        res.status(201).json(order);
    } catch (err) {
        next(err);
    }
}
export async function deliveredOrderController(req, res, next) {
    try {
        const order = await updateOrderStatus(
            req.params.id,
            "DELIVERED",
            "OWNER"
        );

        res.json(order);
    } catch (err) {
        next(err);
    }
}
export async function cancelOrderController(req, res, next) {
    try {
        const order = await updateOrderStatus(
            req.params.id,
            "CANCELLED_BY_CUSTOMER",
            "CUSTOMER"
        );

        res.json(order);
    } catch (err) {
        next(err);
    }
}

export async function acceptOrderController(req, res, next) {
    try {
        const order = await updateOrderStatus(
            req.params.id,
            "ACCEPTED",
            "OWNER"
        );

        res.json(order);
    } catch (err) {
        next(err);
    }
}

export async function rejectOrderController(req, res, next) {
    try {
        const order = await updateOrderStatus(
            req.params.id,
            "CANCELLED_BY_OWNER",
            "OWNER"
        );

        res.json(order);
    } catch (err) {
        next(err);
    }
}

export async function getMyOrdersController(req, res, next) {
    try {
        const orders = await getCustomerOrders(req.user.id);
        res.json(orders);
    } catch (err) {
        next(err);
    }
}

export async function getAllOrdersController(req, res, next) {
    try {
        const orders = await getAllOrders();
        res.json(orders);
    } catch (err) {
        next(err);
    }
}

export async function getAnalyticsController(req, res, next) {
    try {
        const [counts, revenue, mostOrdered, topRevenue, cancellations, dailyRevenue, categoryPerformance] = await Promise.all([
            analytics.getOrderCountTrend(),
            analytics.getRevenueTrend(),
            analytics.getMostOrderedItems(),
            analytics.getTopRevenueItems(),
            analytics.getCancellationStats(),
            analytics.getDailyRevenueLast7Days(),
            analytics.getCategoryPerformance(),
        ]);

        res.json({
            counts,
            revenue,
            mostOrdered,
            topRevenue,
            cancellations,
            dailyRevenue,
            categoryPerformance,
        });
    } catch (err) {
        next(err);
    }
}
