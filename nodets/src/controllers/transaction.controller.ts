import { UploadService } from "$services/transaction.service.ts";
import busboy from "busboy";
import { Request, Response } from "express";

export class UploadController {
  static async handleFileUpload(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User ID not found",
        });
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const bb = busboy({ headers: req.headers });
        let isFileProcessed = false;

        bb.on("file", (name, file, info) => {
          const chunks: Buffer[] = [];

          file.on("data", (chunk) => chunks.push(chunk));

          file.on("end", async () => {
            try {
              const buffer = Buffer.concat(chunks);
              const result = await UploadService.processFile(
                buffer,
                info.mimeType,
                userId
              );
              if (!isFileProcessed) {
                isFileProcessed = true;
                res.json({ success: true, ...result });
                resolve();
              }
            } catch (error) {
              reject(error);
            }
          });
        });

        bb.on("error", (err) => reject(err));

        req.pipe(bb);
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }
}
