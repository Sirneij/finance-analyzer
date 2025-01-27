import { TagsService } from "$services/tags.service.js";
import { ITag } from "$types/article.types.js";
import { Request, Response } from "express";
import { Types } from "mongoose";

export class TagsController {
  async handleGetATag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        res
          .status(400)
          .json({ message: "Invalid tag ID format", success: false });
      }

      const tag = await TagsService.getTagById(id);
      if (!tag) {
        res.status(404).json({ message: "Tag not found", success: false });
      }

      res.status(200).json({ tag, success: true });
    } catch (error) {
      console.error("Error in getTag:", error);
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  }

  async handleGetTags(req: Request, res: Response): Promise<void> {
    try {
      let page = Number(req.query.page);
      let limit = Number(req.query.limit);

      if (isNaN(page)) {
        page = 1;
      }

      if (isNaN(limit)) {
        limit = 10;
      }

      const result = await TagsService.getTags(page, limit);
      res.status(200).json({
        success: true,
        tags: result.tags,
        metadata: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      console.error("Error in getTags:", error);
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  }

  async handleCreateTags(req: Request, res: Response): Promise<void> {
    try {
      let tagsData = req.body;
      if (!tagsData || !Array.isArray(tagsData)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid request body" });
      }

      //   Ensure the names are in lowercase
      tagsData = tagsData.map((tag: ITag) => {
        return { name: tag.name.toLowerCase(), description: tag.description };
      });

      const tags = await TagsService.createTags(tagsData);
      res.status(201).json({ success: true, tags });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({ success: false, message: "Duplicate tag name" });
      }
      console.error("Error in createTags:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async handleDeleteTag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        res
          .status(400)
          .json({ message: "Invalid tag ID format", success: false });
      }

      const deleted = await TagsService.deleteTag(id);
      res.status(204).send({ success: true, deleted });
    } catch (error) {
      console.error("Error in deleteTag:", error);
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  }

  async handleUpdateTag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        res
          .status(400)
          .json({ message: "Invalid tag ID format", success: false });
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        res
          .status(400)
          .json({ message: "No update data provided", success: false });
      }

      const tag = await TagsService.updateTag(id, req.body);
      if (!tag) {
        res.status(404).json({ message: "Tag not found", success: false });
      }

      res.status(200).json({ tag, success: true });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({ message: "Duplicate tag name", success: false });
      }
      console.error("Error in updateTag:", error);
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  }
}
