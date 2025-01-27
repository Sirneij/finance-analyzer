import { SeriesController } from "$controllers/series.controller.js";
import { isJohnOwolabiIdogun } from "$middlewares/auth.middleware.js";
import { Router } from "express";

const seriesRoutes = Router();
const seriesController = new SeriesController();

seriesRoutes.get("/", seriesController.handleGetSeries);
seriesRoutes.get("/:id", seriesController.handleGetSingleSeries);
seriesRoutes.post(
  "/",
  isJohnOwolabiIdogun,
  seriesController.handleCreateSeries
);

export default seriesRoutes;
