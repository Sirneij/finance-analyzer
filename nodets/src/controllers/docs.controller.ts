import { EndpointService } from "$services/docs.services.ts";
import { RequestHandler } from "express";

export class EndpointController {
  private endpointService: EndpointService;

  constructor() {
    this.endpointService = new EndpointService();
  }

  create: RequestHandler = async (req, res, next): Promise<void> => {
    try {
      const endpoint = await this.endpointService.createEndpoint(req.body);
      res.status(201).json(endpoint);
    } catch (error) {
      next(error);
    }
  };

  get: RequestHandler = async (req, res, next): Promise<void> => {
    try {
      const endpoint = await this.endpointService.getEndpoint(req.params.id);
      if (!endpoint) {
        res.status(404).json({ error: "Endpoint not found" });
        return;
      }
      res.json(endpoint);
    } catch (error) {
      next(error);
    }
  };

  update: RequestHandler = async (req, res, next): Promise<void> => {
    try {
      const updated = await this.endpointService.updateEndpoint(
        req.params.id,
        req.body
      );
      if (!updated) {
        res.status(404).json({ error: "Endpoint not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  delete: RequestHandler = async (req, res, next): Promise<void> => {
    try {
      const deleted = await this.endpointService.deleteEndpoint(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Endpoint not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
