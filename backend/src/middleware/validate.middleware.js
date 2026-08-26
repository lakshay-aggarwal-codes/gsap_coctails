 
const validate = (schema, property = "body") => (req, res, next) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid request",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    req[property] = result.data;
    next();
};

export default validate;