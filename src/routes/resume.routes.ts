import { ResumeController } from "$controllers/resume.controller.js";
import { isJohnOwolabiIdogun } from "$middlewares/auth.middleware.js";
import { Router } from "express";

const resumeRouters = Router();
const resumeController = new ResumeController();

resumeRouters.get("/:id", resumeController.handleGetResume);
resumeRouters.post(
  "/",
  isJohnOwolabiIdogun,
  resumeController.handleCreateOrUpdateResume
);

export default resumeRouters;
