import { ArticleController } from "$controllers/article.controller.js";
import { Router } from "express";

const articleRouters = Router();
const articleController = new ArticleController();

articleRouters.post("/upload", articleController.handleFileUpload);
articleRouters.delete("/delete-upload", articleController.handleFileDelete);

articleRouters.post("/", articleController.handleArticleCreate);
articleRouters.get("/", articleController.handleGetArticles);
articleRouters.get("/all", articleController.handleGetAllArticles);
articleRouters.get("/search", articleController.handleSearchArticles);
articleRouters.get("/:id", articleController.handleGetArticle);
articleRouters.patch("/:id", articleController.handleArticleUpdate);
articleRouters.delete("/:id", articleController.handleArticleDelete);

export default articleRouters;
