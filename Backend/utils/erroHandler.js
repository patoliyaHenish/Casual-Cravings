export const handleValidationError = (res, message = "Validation error", statusCode = 400, errors = []) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

export const handleAuthError = (res, message = "Authentication failed", statusCode = 401) => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};

export const handleNotFoundError = (res, message = "Resource not found", statusCode = 404) => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};

export const handleServerError = (res, error, message = "Internal server error", statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: error?.message || error,
    });
};