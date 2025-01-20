import { ResumeController } from "$controllers/resume.controller.js";
import { isAuthenticated } from "$middlewares/auth.middleware.js";
import { Router } from "express";

const resumeRouters = Router();
const resumeController = new ResumeController();

resumeRouters.get("/:id", resumeController.get);
resumeRouters.post("/", isAuthenticated, resumeController.create);

export default resumeRouters;
