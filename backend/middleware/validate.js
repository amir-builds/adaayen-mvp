// backend/middleware/validate.js
import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 422 Unprocessable Entity is common for validation failures
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};
