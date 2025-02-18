import { baseConfig } from "$config/base.config.js";
import { ArticleService } from "$services/article.service.js";
import { cloudinaryService } from "$services/db.service.js";
import type { SearchQuery, UpdateArticleInput } from "$types/article.types.js";
import {
  deleteFilesFromCloudinary,
  generateSlug,
  parseQueryParams,
  processSeriesTitle,
  processTags,
} from "$utils/article.utils.js";
import { processFileUpload } from "$utils/upload.utils.js";
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export class ArticleController {
  async handleFileUpload(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const uploadResult = await processFileUpload(
        req,
        async (buffer, info) => {
          const cloudinary = cloudinaryService.getCloudinary();
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: `media/johnowolabiidogun`,
                transformation: [
                  {
                    width: 1000,
                    height: 420,
                    crop: "fill",
                    gravity: "auto",
                    quality: "auto:best",
                    fetch_format: "auto",
                    flags: ["progressive", "preserve_transparency"],
                    dpr: "auto",
                  },
                ],
              },
              (error, result) => {
                if (error) {
                  baseConfig.logger.error("Error uploading file: ", error);
                  return reject(error);
                }
                if (!result) {
                  return reject(new Error("Upload failed"));
                }
                resolve(result);
              }
            );
            uploadStream.end(buffer);
          });
        }
      );
      res.json({ success: true, uploadResult });
    } catch (error) {
      next(error);
    }
  }

  async handleFileDelete(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.query;
      baseConfig.logger.info(`URL: ${url} `);
      if (!url) {
        throw new Error("image URL is required");
      }
      const deleteResult = await deleteFilesFromCloudinary([url as string]);
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
      const shouldIncrementViews = req.query.views === "1";
      // Fetch article by ID
      const article = await ArticleService.getArticleById(
        id,
        shouldIncrementViews
      );
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
        limit = 12;
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
      if (isPublished === true || isPublished === false)
        updateData.isPublished = isPublished;

      updateData.series = series;

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

  async handleBatchArticleDelete(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("Article IDs array is required");
      }

      const result = await ArticleService.deleteManyArticles(ids);

      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete articles",
      });
    }
  }

  async handleTogglePublish(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("Article IDs array is required");
      }

      const result = await ArticleService.togglePublishManyArticles(ids);

      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to toggle publish articles",
      });
    }
  }

  async handleSearchArticles(req: Request, res: Response): Promise<void> {
    try {
      const params = parseQueryParams(req.query);
      let tags: string[] | mongoose.Types.ObjectId[] = await processTags(
        params.tags || ""
      );

      // Validate sortBy parameter
      const sortBy = params.sortBy === "popular" ? "popular" : "recent";

      const searchParams: SearchQuery = {
        ...params,
        sortBy,
        ...(tags && { tags: tags }),
      };

      // Set a default value of false when req.user is undefined
      const isJohnOwolabiIdogun = req.user?.isJohnOwolabiIdogun ?? false;

      const result = await ArticleService.searchArticles(
        searchParams,
        isJohnOwolabiIdogun
      );

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
        limit = 12;
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

  async handleGetArticleStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await ArticleService.getArticleStats();
      res.json({ success: true, stats });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch article stats",
      });
    }
  }
}
