import { baseConfig } from "$config/base.config.ts";
import { AuthError } from "$types/error.types.ts";
import { Response } from "express";

export const sendAuthError = (res: Response, error: AuthError) => {
  const isApi =
    res.req.xhr || res.req.headers.accept?.includes("application/json");

  if (isApi) {
    return res.status(error.statusCode).json({
      success: false,
      type: error.type,
      message: error.message,
      provider: error.provider,
    });
  }

  const params = new URLSearchParams({
    error: error.message,
    ...(error.provider && { provider: error.provider }),
  });

  return res.redirect(`${baseConfig.frontendUrl}/auth/login?${params}`);
};
