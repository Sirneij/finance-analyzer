import { AuthErrorType, ProviderMismatchError } from "$types/error.types.js";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { sendAuthError } from "$utils/error.utils.js";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res
    .status(401)
    .json({ message: "Unauthenticated. Kindly login to proceed." });
};

export const isJohnOwolabiIdogun = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated() && req.user?.isJohnOwolabiIdogun) {
    return next();
  }
  res
    .status(403)
    .json({
      message: "Forbidden. You are not authorized to perform this action.",
    });
};

export const handleAuthError: ErrorRequestHandler = (
  err,
  req,
  res,
  next
): void => {
  if (err instanceof ProviderMismatchError) {
    const authError = {
      name: "ProviderMismatchError",
      type: AuthErrorType.PROVIDER_MISMATCH,
      message: err.message,
      statusCode: 401,
      provider: err.provider,
    };
    sendAuthError(res, authError);
    return;
  }
  next(err);
};
