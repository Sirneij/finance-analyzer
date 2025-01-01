import { Request, Response } from "express";

export class AuthController {
  static async loginSuccess(req: Request, res: Response) {
    if (req.user) {
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: req.user,
      });
    }
  }

  static async loginFailure(req: Request, res: Response) {
    res.status(401).json({
      success: false,
      message: "Login failed",
    });
  }

  static async logout(req: Request, res: Response) {
    req.logout(() => {
      res.redirect("/");
    });
  }
}
