import { baseConfig } from "$config/base.config.js";
import { AuthError } from "$types/error.types.js";
import { Response } from "express";
import { WebSocket } from "ws";

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

export function sendError(ws: WebSocket, message: string, action?: string) {
  ws.send(JSON.stringify({ error: message, action }));
}
