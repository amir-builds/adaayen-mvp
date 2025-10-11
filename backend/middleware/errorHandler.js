// middleware/errorHandler.js
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Centralized error handler (optional but recommended)
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
;
