import { Request, Response, NextFunction } from "express";
import { EndpointService } from "$services/docs.services.js";

export class EndpointController {
  async handleCreateDoc(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const endpoint = await EndpointService.createEndpoint(req.body);
      res.status(201).json({ endpoint, success: true });
    } catch (error) {
      next(error);
    }
  }

  async handleGetDoc(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const endpoint = await EndpointService.getEndpoint(req.params.id);
      if (!endpoint) {
        res.status(404).json({ message: "Endpoint not found", success: false });
        return;
      }
      res.json({ endpoint, success: true });
    } catch (error) {
      next(error);
    }
  }

  async handleGetDocs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const endpoints = await EndpointService.getAllEndpoints();
      res.status(200).json({ endpoints, success: true });
    } catch (error) {
      next(error);
    }
  }

  async handleUpdateDoc(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const endpoint = await EndpointService.updateEndpoint(
        req.params.id,
        req.body
      );
      if (!endpoint) {
        res.status(404).json({ message: "Endpoint not found", success: false });
        return;
      }
      res.json(endpoint);
    } catch (error) {
      next(error);
    }
  }

  async handleDeleteDoc(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await EndpointService.deleteEndpoint(req.params.id);
      if (!result) {
        res.status(404).json({ message: "Endpoint not found", success: false });
        return;
      }
      res.status(204).send({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
