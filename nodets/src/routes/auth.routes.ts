import { Router } from "express";
import passport from "passport";
import { AuthController } from "$controllers/auth.controller.js";
import { isAuthenticated } from "$middlewares/auth.middleware.js";
import { baseConfig } from "$config/base.config.js";

const authRouters = Router();
const authController = new AuthController();

authRouters.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRouters.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/v1/auth/failure" }),
  authController.loginSuccess
);

authRouters.get("/github", (req, res, next) => {
  const state = req.query.next
    ? Buffer.from(req.query.next as string).toString("base64")
    : "";
  passport.authenticate("github", {
    scope: ["user:email"],
    state,
  })(req, res, next);
});

authRouters.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/api/v1/auth/failure" }),
  (req, res, next) => {
    // Enhanced debugging
    baseConfig.logger.info(`Session ID: ${req.sessionID}`);
    baseConfig.logger.info(`Session data: ${JSON.stringify(req.session)}`);
    baseConfig.logger.info(`Request headers: ${JSON.stringify(req.headers)}`);
    baseConfig.logger.info(
      `Response headers before: ${JSON.stringify(res.getHeaders())}`
    );

    // Ensure cookie is set explicitly
    // res.cookie("connect.sid", req.sessionID, {
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //   httpOnly: true,
    //   maxAge: 24 * 60 * 60 * 1000,
    //   // domain:
    //   //   process.env.NODE_ENV === "production"
    //   //     ? baseConfig.cookieDomain
    //   //     : undefined,
    // });

    baseConfig.logger.info(
      `Response headers after: ${JSON.stringify(res.getHeaders())}`
    );
    next();
  },
  authController.loginSuccess
);

authRouters.get("/session", isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

authRouters.get("/failure", authController.loginFailure);
authRouters.get("/logout", authController.logout);

export default authRouters;
