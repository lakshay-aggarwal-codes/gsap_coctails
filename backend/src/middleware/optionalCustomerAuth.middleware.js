import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";

const optionalCustomerAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === "customer") {
            const customer = await Customer.findById(decoded.id);
            if (customer) {
                req.customer = customer;
            }
        }
    } catch {
        // Invalid or expired token on an optional-auth route: proceed as a guest.
    }

    next();
};

export default optionalCustomerAuth;