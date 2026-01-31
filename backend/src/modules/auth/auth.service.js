import prisma from "../../config/prisma.js";
import { signToken } from "../../config/jwt.js";
import { hashValue, compareValue } from "../../config/bcrypt.js";

const OTP_EXPIRY_MINUTES = 5;



function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


export async function requestOtp(phone) {
    const otp = generateOTP();
    const otpHash = await hashValue(otp);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    // Remove any existing OTPs
    await prisma.otpVerification.deleteMany({
        where: { phone },
    });

    await prisma.otpVerification.create({
        data: {
            phone,
            otpHash,
            expiresAt,
            attempts: 0,
        },
    });

    // DEV ONLY: log OTP instead of SMS
    console.log(`OTP for ${phone}: ${otp}`);

    return true;
}

export async function verifyOtp(phone, otp) {
    const record = await prisma.otpVerification.findFirst({
        where: { phone },
    });

    if (!record) {
        throw new Error("OTP not found or expired");
    }

    if (record.expiresAt < new Date()) {
        throw new Error("OTP expired");
    }

    if (record.attempts >= 5) {
        throw new Error("Too many attempts");
    }

    const isValid = await compareValue(otp, record.otpHash);

    if (!isValid) {
        await prisma.otpVerification.update({
            where: { id: record.id },
            data: { attempts: record.attempts + 1 },
        });
        throw new Error("Invalid OTP");
    }

    // Find or create user
    let user = await prisma.user.findUnique({
        where: { phone },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                phone,
                role: "CUSTOMER",
                name: "New User",
            },
        });
    }

    // Cleanup OTP
    await prisma.otpVerification.delete({
        where: { id: record.id },
    });

    const token = signToken({
        userId: user.id,
        role: user.role,
    });

    return { user, token };
}


export async function loginWithPassword(phone, password) {
    const user = await prisma.user.findUnique({
        where: { phone },
    });

    if (!user || !user.passwordHash) {
        throw new Error("Invalid credentials");
    }

    const isValid = await compareValue(password, user.passwordHash);

    if (!isValid) {
        throw new Error("Invalid credentials");
    }

    const token = signToken({
        userId: user.id,
        role: user.role,
    });

    return { user, token };
}

export async function registerUser({ name, phone, password, role }) {
    const existingUser = await prisma.user.findUnique({
        where: { phone },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }
    const allowedRole = "CUSTOMER";

    const passwordHash = await hashValue(password);

    const user = await prisma.user.create({
        data: {
            name,
            phone,
            role: allowedRole,
            passwordHash,
        },
    });

    const token = signToken({
        userId: user.id,
        role: user.role,
    });

    return { user, token };
}