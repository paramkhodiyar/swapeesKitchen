import {
    registerUser,
    loginWithPassword,
    verifyOtp,
    requestOtp,
} from "./auth.service.js";

export async function requestOtpController(req, res, next) {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: "Phone is required" });
        }

        await requestOtp(phone);

        res.json({ message: "OTP sent successfully" });
    } catch (err) {
        next(err);
    }
}

export async function verifyOtpController(req, res, next) {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ message: "Phone and OTP are required" });
        }

        const result = await verifyOtp(phone, otp);

        res.json({
            message: "Login successful",
            user: result.user,
            token: result.token,
        });
    } catch (err) {
        next(err);
    }
}

export async function passwordLoginController(req, res, next) {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res
                .status(400)
                .json({ message: "Phone and password are required" });
        }

        const result = await loginWithPassword(phone, password);

        res.json({
            message: "Login successful",
            user: result.user,
            token: result.token,
        });
    } catch (err) {
        next(err);
    }
}

export async function meController(req, res) {
    res.json({ user: req.user });
}

export async function registerUserController(req, res, next) {
    try {
        const { name, phone, password } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const result = await registerUser({ name, phone, password });

        res.status(201).json({
            message: "User registered successfully",
            user: result.user,
            token: result.token,
        });
    } catch (err) {
        next(err);
    }
}
