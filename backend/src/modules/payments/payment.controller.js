import {
    requestPayment,
    confirmPayment,
} from "./payment.service.js";

// CUSTOMER
export async function requestPaymentController(req, res, next) {
    try {
        const data = await requestPayment(
            req.params.orderId,
            req.user.id
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// WEBHOOK (NO AUTH)
export async function paymentWebhookController(req, res, next) {
    try {
        await confirmPayment(req.body);
        res.json({ status: "ok" });
    } catch (err) {
        next(err);
    }
}
