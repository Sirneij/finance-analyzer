import { TagsController } from "$controllers/tags.controller.js";
import { isJohnOwolabiIdogun } from "$middlewares/auth.middleware.js";
import { Router } from "express";

const tagsRoutes = Router();
const controller = new TagsController();

tagsRoutes.get("/", controller.handleGetTags);
tagsRoutes.get("/:id", controller.handleGetATag);
tagsRoutes.post("/", isJohnOwolabiIdogun, controller.handleCreateTags);
tagsRoutes.patch("/:id", isJohnOwolabiIdogun, controller.handleUpdateTag);
tagsRoutes.delete("/:id", isJohnOwolabiIdogun, controller.handleDeleteTag);

export default tagsRoutes;
