import { SeriesController } from "$controllers/series.controller.js";
import { Router } from "express";

const seriesRoutes = Router();
const seriesController = new SeriesController();

seriesRoutes.get("/", seriesController.handleGetSeries);
seriesRoutes.get("/:id", seriesController.handleGetSingleSeries);
seriesRoutes.post("/", seriesController.handleCreateSeries);

export default seriesRoutes;
