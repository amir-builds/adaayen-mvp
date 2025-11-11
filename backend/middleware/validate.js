// backend/middleware/validate.js
import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return user-friendly error message along with detailed errors
    const firstError = errors.array()[0];
    return res.status(422).json({ 
      message: firstError.msg || 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};
