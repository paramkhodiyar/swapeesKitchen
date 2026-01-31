import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["JWT_SECRET"];

requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required env variable: ${key}`);
    }
});

export default {
    JWT_SECRET: process.env.JWT_SECRET,
};
