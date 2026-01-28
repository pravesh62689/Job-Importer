export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const errorHandler = (err, req, res, next) => {
  res.status(500).json({ message: err.message || "Server error" });
};
