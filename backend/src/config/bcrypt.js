import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashValue(value) {
    return bcrypt.hash(value, SALT_ROUNDS);
}

export async function compareValue(value, hash) {
    return bcrypt.compare(value, hash);
}
