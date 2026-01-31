export default function errorMiddleware(err, req, res, next) {
    console.error("ERROR:", err);

    const statusCode = err.statusCode || 500;
    const message =
        err.message || "Something went wrong, please try again";

    res.status(statusCode).json({
        success: false,
        message,
    });
}
