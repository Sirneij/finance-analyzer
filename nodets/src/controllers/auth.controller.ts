import { baseConfig } from "$config/base.config.ts";
import { Request, Response } from "express";

export class AuthController {
  static async loginSuccess(req: Request, res: Response) {
    if (req.user) {
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        // API request - return JSON
        res.status(200).json({
          success: true,
          message: "Login successful",
          user: req.user,
        });
      } else {
        // Browser request - redirect
        res.redirect(`${baseConfig.frontendUrl}`);
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
