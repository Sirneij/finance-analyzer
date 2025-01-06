import { baseConfig } from "$config/base.config.ts";
import { Request, Response } from "express";

export class AuthController {
  static async loginSuccess(req: Request, res: Response) {
    if (req.user) {
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        res.status(200).json({
          success: true,
          message: "Login successful",
          user: req.user,
        });
      } else {
        const state = req.query.state;
        let redirectPath = "/";

        if (state) {
          try {
            redirectPath = Buffer.from(state as string, "base64").toString();
          } catch (error) {
            baseConfig.logger.error("Failed to decode state parameter:", error);
          }
        }

        res.redirect(`${baseConfig.frontendUrl}${redirectPath}`);
      }
    }
  }

  static async loginFailure(req: Request, res: Response) {
    res.redirect(`${baseConfig.frontendUrl}/auth/login?error=true`);
  }

  static async logout(req: Request, res: Response) {
    req.logout(() => {
      res.redirect(`${baseConfig.frontendUrl}/auth/login`);
    });
  }
}
