import { baseConfig } from "$config/base.config.js";
import { Request, Response } from "express";

export class AuthController {
  async loginSuccess(req: Request, res: Response) {
    if (req.user) {
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        res.status(200).json({
          success: true,
          message: "Login successful",
          user: req.user,
        });
      } else {
        const state = req.query.state as string | undefined;
        let redirectPath = "/";

        if (state) {
          try {
            // Validate if the state is Base64
            const base64Regex = /^[A-Za-z0-9+/=]+$/;
            if (base64Regex.test(state)) {
              redirectPath = Buffer.from(state, "base64").toString();
            } else {
              throw new Error("Invalid Base64 input");
            }
          } catch (error) {
            baseConfig.logger.error("Failed to decode state parameter:", error);
          }
        }

        res.redirect(`${baseConfig.frontendUrl}${redirectPath}`);
      }
    }
  }

  async loginFailure(req: Request, res: Response) {
    res.redirect(`${baseConfig.frontendUrl}/auth/login?error=true`);
  }

  async logout(req: Request, res: Response) {
    req.logout(() => {
      res.redirect(`${baseConfig.frontendUrl}/auth/login`);
    });
  }
}
