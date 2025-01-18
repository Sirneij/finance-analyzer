import { ResumeService } from "$services/resume.service.js";
import { Request, Response, NextFunction } from "express";
import busboy from "busboy";
import { baseConfig } from "$config/base.config.js";

export class ResumeController {
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resume = await ResumeService.getResume(req.params.id);
      if (!resume) {
        res.status(404).json({ error: "Resume not found" });
        return;
      }
      res.json(resume);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        const bb = busboy({ headers: req.headers });
        const chunks: Buffer[] = [];
        let isFileProcessed = false;

        bb.on("file", (name, file, info) => {
          if (!info.mimeType.includes("pdf")) {
            reject(new Error("Only PDF files are supported"));
            return;
          }

          file.on("data", (chunk) => chunks.push(chunk));

          file.on("end", async () => {
            try {
              if (!isFileProcessed) {
                isFileProcessed = true;
                const fileBuffer = Buffer.concat(chunks);
                const resume = await ResumeService.createResume(fileBuffer);
                res.json({
                  success: true,
                  data: resume,
                });
                resolve();
              }
            } catch (err) {
              baseConfig.logger.error(`Catch: ${err}`);
              reject(err);
            }
          });
        });

        bb.on("error", reject);
        req.pipe(bb);
      });
    } catch (error) {
      baseConfig.logger.error(`Outter Catch: ${error}`);
      next(error);
    }
  }
}
