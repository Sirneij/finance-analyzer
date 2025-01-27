import { baseConfig } from "$config/base.config.js";
import { SeriesService } from "$services/series.service.js";
import { Request, Response } from "express";

export class SeriesController {
  async handleGetSingleSeries(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const series = await SeriesService.getSeriesById(id);
      if (!series) {
        res.status(404).json({ message: "Series not found", success: false });
        return;
      }
      res.status(200).json({ series, success: true });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  }

  async handleGetSeries(req: Request, res: Response): Promise<void> {
    try {
      let page = Number(req.query.page);
      let limit = Number(req.query.limit);

      if (isNaN(page)) {
        page = 1;
      }

      if (isNaN(limit)) {
        limit = 10;
      }

      const result = await SeriesService.getSeries(page, limit);

      res.status(200).json({
        success: true,
        series: result.series,
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
          error instanceof Error ? error.message : "Failed to get series",
      });
    }
  }

  async handleCreateSeries(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      baseConfig.logger.info(`Creating series: ${JSON.stringify(data)}`);
      // Validate the request body. It should be an array of objects
      if (!data || !Array.isArray(data)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid request body" });
        return;
      }

      const series = await SeriesService.createSeries(data);

      res.json({ success: true, series });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create series",
      });
    }
  }
}
