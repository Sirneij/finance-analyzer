import { AuthErrorType, ProviderMismatchError } from "$types/error.types.ts";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { sendAuthError } from "utils/error.utils.ts";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
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
