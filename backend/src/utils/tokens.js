import crypto from "crypto";

const createToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    return { rawToken, tokenHash };
};

const hashToken = (rawToken) => crypto.createHash("sha256").update(rawToken).digest("hex");

export { createToken, hashToken };
