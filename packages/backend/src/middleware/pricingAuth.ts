import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.js";

/**
 * Middleware to ensure only professors can access pricing endpoints (T057)
 * Pricing information should only be visible to professors, never to students
 */
export function pricingAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = req.user;

  if (!user) {
    throw new AppError(401, "Authentication required");
  }

  // Check if user is a professor (isAdmin indicates professor role in this system)
  if (!user.isAdmin) {
    throw new AppError(
      403,
      "Access denied. Only professors can manage pricing information.",
    );
  }

  next();
}
