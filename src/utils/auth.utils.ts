import { baseConfig } from "$config/base.config";
import type { Request } from "express";

export const extractRequestState = (req: Request, defaultNext = "/") => {
  const state = req.query.state as string | undefined;
  let redirectPath = defaultNext;

  if (state) {
    try {
      // Validate if the state is Base64
      const base64Regex = /^[A-Za-z0-9+/=]+$/;
      if (base64Regex.test(state)) {
        redirectPath = Buffer.from(state, "base64").toString();
      } else {
        baseConfig.logger.warn("Invalid state parameter:", state);
      }
    } catch (error) {
      baseConfig.logger.error("Failed to decode state parameter:", error);
    }
  }

  return redirectPath;
};
