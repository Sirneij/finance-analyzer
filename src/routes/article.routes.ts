import { ArticleController } from "$controllers/article.controller.js";
import { isJohnOwolabiIdogun } from "$middlewares/auth.middleware.js";
import { Router } from "express";

const articleRouters = Router();
const articleController = new ArticleController();

articleRouters.post(
  "/upload",
  isJohnOwolabiIdogun,
  articleController.handleFileUpload
);
articleRouters.delete(
  "/delete-upload",
  isJohnOwolabiIdogun,
  articleController.handleFileDelete
);
articleRouters.post(
  "/",
  isJohnOwolabiIdogun,
  articleController.handleArticleCreate
);
articleRouters.get("/", articleController.handleGetArticles);
articleRouters.get("/all", articleController.handleGetAllArticles);
articleRouters.get("/search", articleController.handleSearchArticles);

// Static routes first
articleRouters.get(
  "/stats/metrics",
  isJohnOwolabiIdogun,
  articleController.handleGetArticleStats
);
articleRouters.post(
  "/toggle/publish",
  isJohnOwolabiIdogun,
  articleController.handleTogglePublish
);
articleRouters.post(
  "/batch/delete",
  isJohnOwolabiIdogun,
  articleController.handleBatchArticleDelete
);

// Parameter routes last
articleRouters.get("/:id", articleController.handleGetArticle);
articleRouters.patch(
  "/:id",
  isJohnOwolabiIdogun,
  articleController.handleArticleUpdate
);
articleRouters.delete(
  "/:id",
  isJohnOwolabiIdogun,
  articleController.handleArticleDelete
);

export default articleRouters;
