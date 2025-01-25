import { TagsController } from "$controllers/tags.controller.js";
import { Router } from "express";

const tagsRoutes = Router();
const controller = new TagsController();

tagsRoutes.get("/", controller.handleGetTags);
tagsRoutes.get("/:id", controller.handleGetATag);
tagsRoutes.post("/", controller.handleCreateTags);
tagsRoutes.patch("/:id", controller.handleUpdateTag);
tagsRoutes.delete("/:id", controller.handleDeleteTag);

export default tagsRoutes;
