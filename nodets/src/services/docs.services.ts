import { RouteInfo } from "$types/docs.types.ts";
import { getAllMetadata } from "$utils/docs.utils.ts";

export class ApiDocumentationGenerator {
  private static getRoutesFromLayer(
    layer: any,
    basePath: string = ""
  ): RouteInfo[] {
    const routes: RouteInfo[] = [];
    const metadata = getAllMetadata();

    if (layer.route) {
      const path = this.cleanRoutePath(basePath + layer.route.path);

      Object.keys(layer.route.methods).forEach((method) => {
        // Try to find controller method name from middleware stack
        const handler = layer.route.stack.find(
          (s: any) => s.name !== "anonymous" && s.name !== "bound dispatch"
        )?.handle;

        let routeMetadata;
        if (handler) {
          const className =
            handler.constructor?.name || handler.prototype?.constructor?.name;
          const methodName = handler.name;
          const key = `${className}.${methodName}`;
          routeMetadata = metadata.get(key);
        }

        routes.push({
          path,
          method: method.toUpperCase(),
          middlewares: layer.route.stack.map((s: any) => s.name || "anonymous"),
          metadata: routeMetadata,
        });
      });
    } else if (layer.name === "router") {
      let routerPath = layer.regexp.source;
      // Extract the actual path from regex source
      routerPath = routerPath
        .replace(/^\^/, "") // Remove start anchor
        .replace(/\$/, "") // Remove end anchor
        .replace(/\\\/\?\(\?=/, "/") // Clean router patterns
        .replace(/\\\//g, "/"); // Clean escaped slashes

      const currentBasePath =
        layer.regexp.source === "^\\/?$" ? basePath : basePath + routerPath;

      layer.handle.stack.forEach((stackItem: any) => {
        routes.push(...this.getRoutesFromLayer(stackItem, currentBasePath));
      });
    }

    return routes;
  }

  static generate(app: any): RouteInfo[] {
    const routes: RouteInfo[] = [];
    app._router.stack.forEach((layer: any) => {
      routes.push(...this.getRoutesFromLayer(layer));
    });
    return routes;
  }

  private static cleanRoutePath(path: string): string {
    return (
      path
        // Remove regex patterns
        .replace(/\?\(\?=.*?\|/g, "")
        // Remove remaining regex artifacts
        .replace(/[\|\)]/g, "")
        // Remove escape characters
        .replace(/\\/g, "")
        // Clean up any double slashes
        .replace(/\/+/g, "/")
        // Remove trailing slash
        .replace(/\/$/, "")
    );
  }
}

import { EndpointModel, IEndpoint } from "$models/docs.model.ts";

export class EndpointService {
  async createEndpoint(
    data: Omit<IEndpoint, "id" | "createdAt" | "updatedAt">
  ): Promise<IEndpoint> {
    const endpoint = new EndpointModel(data);
    return await endpoint.save();
  }

  async getEndpoint(id: string): Promise<IEndpoint | null> {
    return await EndpointModel.findById(id);
  }

  async updateEndpoint(
    id: string,
    data: Partial<IEndpoint>
  ): Promise<IEndpoint | null> {
    return await EndpointModel.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteEndpoint(id: string): Promise<boolean> {
    const result = await EndpointModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllEndpoints(): Promise<IEndpoint[]> {
    return await EndpointModel.find();
  }

  async getEndpointsByCategory(category: string): Promise<IEndpoint[]> {
    return await EndpointModel.find({ category });
  }
}
