import { SeriesController } from "$controllers/series.controller.js";
import { isJohnOwolabiIdogun } from "$middlewares/auth.middleware.js";
import { Router } from "express";

const seriesRoutes = Router();
const seriesController = new SeriesController();

seriesRoutes.get("/", seriesController.handleGetSeries);
seriesRoutes.post(
  "/",
  isJohnOwolabiIdogun,
  seriesController.handleCreateSeries
);
seriesRoutes.patch(
  "/",
  isJohnOwolabiIdogun,
  seriesController.handleUpdateManySeries
);
seriesRoutes.post(
  "/batch/delete",
  isJohnOwolabiIdogun,
  seriesController.handleDeleteManySeries
);
seriesRoutes.get("/:id", seriesController.handleGetSingleSeries);

export default seriesRoutes;
