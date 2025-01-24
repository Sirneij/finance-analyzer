import { baseConfig } from "$config/base.config.js";
import { cloudinaryService } from "$services/db.service.js";
import busboy from "busboy";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export class ArticleController {
  async handleFileUpload(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;

      await new Promise<void>((resolve, reject) => {
        const bb = busboy({ headers: req.headers });

        bb.on("file", (name, file, info) => {
          const chunks: Buffer[] = [];

          file.on("data", (chunk) => chunks.push(chunk));

          file.on("end", async () => {
            try {
              const buffer = Buffer.concat(chunks);
              const cloudinary = cloudinaryService.getCloudinary();
              try {
                const uploadResult = await new Promise<UploadApiResponse>(
                  (resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                      {
                        folder: `media/johnowolabiidogun`,
                      },
                      (
                        error: UploadApiErrorResponse | undefined,
                        result: UploadApiResponse | undefined
                      ) => {
                        if (error) return reject(error);
                        if (!result) return reject(new Error("Upload failed"));
                        resolve(result);
                      }
                    );
                    uploadStream.end(buffer);
                  }
                );

                res.json({ success: true, ...uploadResult });
              } catch (error) {
                next(error);
              }
            } catch (err) {
              baseConfig.logger.error(`Catch: ${err}`);
              reject(err);
            }
          });
        });

        bb.on("error", (err) => {
          baseConfig.logger.error(`OnError: ${err}`);
          reject(err);
        });

        req.pipe(bb);
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
      });
    }
  }
}
