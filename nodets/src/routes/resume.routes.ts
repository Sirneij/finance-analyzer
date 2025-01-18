import { ResumeController } from "$controllers/resume.controller.js";
import { Router } from "express";

const resumeRouters = Router();
const resumeController = new ResumeController();

resumeRouters.get("/:id", resumeController.get);
resumeRouters.post("/", resumeController.create);

export default resumeRouters;
