// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((error) => error.message);
        return res.status(400).json({
            error: "Validation Error",
            details: errors,
        });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            error: "Invalid token",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            error: "Token expired",
        });
    }

    // MySQL errors
    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            error: "Duplicate entry",
            message: "Resource already exists",
        });
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
            error: "Foreign key constraint",
            message: "Referenced resource does not exist",
        });
    }

    // if (err.code === "ER_DUP_ENTRY") {
    //     return res.status(400).json({
    //         error: "Foreign key constraint",
    //         message: "Referenced resource does not exist",
    //     });
    // }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

// 404 handler
const notFound = (req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = { errorHandler, notFound };
