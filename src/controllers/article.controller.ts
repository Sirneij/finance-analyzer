import { baseConfig } from "$config/base.config.js";
import { ArticleService } from "$services/article.service.js";
import { cloudinaryService } from "$services/db.service.js";
import {
  IArticlePopulated,
  SearchQuery,
  UpdateArticleInput,
} from "$types/article.types.js";
import {
  generateSlug,
  getPublicId,
  parseQueryParams,
  processSeriesTitle,
  processTags,
} from "$utils/article.utils.js";
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
                        transformation: {
                          // crop: "imagga_scale",
                          format: "auto",
                          flags: "progressive",
                          height: 420,
                          quality: "auto",
                          width: 1000,
                        },
                      },
                      (
                        error: UploadApiErrorResponse | undefined,
                        result: UploadApiResponse | undefined
                      ) => {
                        if (error) {
                          baseConfig.logger.error(
                            "Error uploading file: ",
                            error
                          );
                          return reject(error);
                        }
                        if (!result) {
                          return reject(new Error("Upload failed"));
                        }
                        resolve(result);
                      }
                    );
                    uploadStream.end(buffer);
                  }
                );

                res.json({ success: true, uploadResult });
              } catch (error) {
                baseConfig.logger.error("Error uploading file: ", error);
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
        message:
          error instanceof Error ? error.message : "Failed to upload file",
      });
    }
  }

  async handleFileDelete(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.query;
      baseConfig.logger.info(`URL: ${url} `);
      if (!url) {
        throw new Error("image URL is required");
      }

      const publicId = getPublicId(url as string);

      const cloudinary = cloudinaryService.getCloudinary();
      const deleteResult = await cloudinary.uploader.destroy(publicId);

      res.json({ success: true, ...deleteResult });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete file",
      });
    }
  }

  async handleGetArticle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error("Article ID is required");
      }
      // Fetch article by ID
      const article = await ArticleService.getArticleById(id);
      if (!article) {
        throw new Error("Article not found");
      }

      res.json({ success: true, article });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch article",
      });
    }
  }

  async handleGetArticles(req: Request, res: Response): Promise<void> {
    try {
      let page = Number(req.query.page);
      let limit = Number(req.query.limit);

      if (isNaN(page)) {
        page = 1;
      }

      if (isNaN(limit)) {
        limit = 10;
      }

      const result = await ArticleService.getPublishedArticles(page, limit);

      res.json({
        success: true,
        articles: result.articles,
        metadata: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch articles",
      });
    }
  }

  async handleArticleCreate(req: Request, res: Response): Promise<void> {
    try {
      let { title, foreImage, content, tags, series, isPublished } = req.body;
      if (!title || !content || !tags || !foreImage) {
        throw new Error("Title, content, tags, and foreImage are required");
      }

      // Check if each tag is a valid ObjectId
      tags = await processTags(tags);

      // Generate slug from title
      const slug = generateSlug(title);

      // Process series title
      if (series) {
        series = await processSeriesTitle(series);
      }

      const article = await ArticleService.createArticle({
        title,
        foreImage,
        slug,
        content,
        tags,
        series,
        isPublished,
      });

      res.json({ success: true, article });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create article",
      });
    }
  }

  async handleArticleUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // This is a patch request so any of the fields can be updated
      let { title, foreImage, content, tags, series, isPublished } = req.body;

      const updateData = {} as UpdateArticleInput;

      if (title) {
        const slug = generateSlug(title);
        updateData.slug = slug;
        updateData.title = title;
      }
      if (foreImage) updateData.foreImage = foreImage;
      if (content) updateData.content = content;
      if (tags) updateData.tags = tags;
      if (series) updateData.series = series;
      if (isPublished === true || isPublished === false)
        updateData.isPublished = isPublished;

      const article = await ArticleService.updateArticle(id, updateData);

      res.json({ success: true, article });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update article",
      });
    }
  }

  async handleArticleDelete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error("Article ID is required");
      }

      await ArticleService.deleteArticle(id);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete article",
      });
    }
  }

  async handleSearchArticles(req: Request, res: Response): Promise<void> {
    try {
      const params = parseQueryParams(req.query);
      let tags: string[] | mongoose.Types.ObjectId[] = [];
      if (params.tags) {
        tags = await processTags(params.tags);
      }
      // Validate sortBy parameter
      const sortBy = params.sortBy === "popular" ? "popular" : "recent";

      const searchParams: SearchQuery = {
        ...params,
        sortBy,
        ...(tags && { tags: tags }),
      };

      const result = await ArticleService.searchArticles(searchParams);

      res.json({
        success: true,
        articles: result.articles,
        metadata: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch articles",
      });
    }
  }

  async handleGetAllArticles(req: Request, res: Response): Promise<void> {
    try {
      let page = Number(req.query.page);
      let limit = Number(req.query.limit);

      if (isNaN(page)) {
        page = 1;
      }

      if (isNaN(limit)) {
        limit = 10;
      }
      const result = await ArticleService.getAllArticles(page, limit);
      res.json({
        success: true,
        articles: result.articles,
        metadata: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch articles",
      });
    }
  }
}
