import { baseConfig } from "$config/base.config.js";
import { extractRequestState } from "$utils/auth.utils.js";
import type { Request, Response } from "express";

export class AuthController {
  async handleLoginSuccess(req: Request, res: Response) {
    if (req.user) {
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        res.status(200).json({
          success: true,
          message: "Login successful",
          user: req.user,
        });
      } else {
        const redirectPath = extractRequestState(req, "/");

        baseConfig.logger.info(
          `Redirecting to ${baseConfig.frontendUrl}${redirectPath}`
        );
        res.redirect(`${baseConfig.frontendUrl}${redirectPath}`);
      }
    }
  }

  async handleLoginFailure(req: Request, res: Response) {
    baseConfig.logger.info(
      `Redirecting to ${baseConfig.frontendUrl}/finanalyzer/auth/login?error=true`
    );
    res.redirect(`${baseConfig.frontendUrl}/finanalyzer/auth/login?error=true`);
  }

  async handleLogout(req: Request, res: Response) {
    req.logout(() => {
      const redirectPath = req.query.next || "/finanalyzer/auth/login";
      baseConfig.logger.info(
        `Redirecting to ${baseConfig.frontendUrl}${redirectPath}`
      );
      res.redirect(`${baseConfig.frontendUrl}${redirectPath}`);
    });
  }
}
