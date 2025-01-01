import { Router } from "express";
import passport from "passport";
import { AuthController } from "$controllers/auth.controller.ts";

const authRouters = Router();

authRouters.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRouters.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/v1/auth/failure" }),
  AuthController.loginSuccess
);

authRouters.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
authRouters.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/api/v1/auth/failure" }),
  AuthController.loginSuccess
);

authRouters.get("/failure", AuthController.loginFailure);
authRouters.get("/logout", AuthController.logout);

export default authRouters;
