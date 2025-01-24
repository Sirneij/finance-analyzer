import { ArticleController } from "$controllers/article.controller.js";
import { Router } from "express";

const articleRouters = Router();
const articleController = new ArticleController();

articleRouters.post("/upload", articleController.handleFileUpload);

export default articleRouters;
