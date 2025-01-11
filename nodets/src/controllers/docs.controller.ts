import { Request, Response, NextFunction } from "express";
import { EndpointService } from "$services/docs.services.ts";

export class EndpointController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const endpoint = await EndpointService.createEndpoint(req.body);
      res.status(201).json(endpoint);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const endpoint = await EndpointService.getEndpoint(req.params.id);
      if (!endpoint) {
        res.status(404).json({ error: "Endpoint not found" });
        return;
      }
      res.json(endpoint);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const endpoints = await EndpointService.getAllEndpoints();
      res.json(endpoints);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const endpoint = await EndpointService.updateEndpoint(
        req.params.id,
        req.body
      );
      if (!endpoint) {
        res.status(404).json({ error: "Endpoint not found" });
        return;
      }
      res.json(endpoint);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EndpointService.deleteEndpoint(req.params.id);
      if (!result) {
        res.status(404).json({ error: "Endpoint not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
