import { ResumeService } from "$services/resume.service.js";
import type { Request, Response, NextFunction } from "express";
import { baseConfig } from "$config/base.config.js";
import { processFileUpload } from "$utils/upload.utils.js";

export class ResumeController {
  async handleGetResume(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const resume = await ResumeService.getResume(req.params.id);
      if (!resume) {
        res.status(404).json({ message: "Resume not found" });
        return;
      }
      res.json(resume);
    } catch (error) {
      next(error);
    }
  }

  async handleCreateOrUpdateResume(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const resume = await processFileUpload(req, async (buffer, info) => {
        if (!info.mimeType.includes("pdf")) {
          throw new Error("Only PDF files are supported");
        }
        return await ResumeService.createResume(buffer);
      });
      res.json({
        success: true,
        data: resume,
      });
    } catch (error) {
      baseConfig.logger.error(`Outter Catch: ${error}`);
      next(error);
    }
  }
}
