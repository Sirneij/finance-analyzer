import { RouteInfo } from "$types/docs.types.ts";
import { getAllMetadata } from "$utils/docs.utils.ts";
import { EndpointModel, IEndpoint } from "$models/docs.model.ts";

export class ApiDocumentationGenerator {
  private static getHandlerClassName(handler: Function): string {
    // Method 1: Try getting from function properties
    const directClassName = handler.name || handler?.constructor?.name;
    if (
      directClassName &&
      !directClassName.includes("bound") &&
      directClassName !== "AsyncFunction"
    ) {
      return directClassName;
    }

    // Method 2: Try getting from prototype
    if (handler.prototype?.constructor?.name) {
      return handler.prototype.constructor.name;
    }

    // Method 3: Parse from function toString()
    const fnString = handler.toString();
    const classMatch = fnString.match(/class\s+(\w+)\s*{/);
    if (classMatch?.[1]) {
      return classMatch[1];
    }

    // Method 4: Check for bound method
    if (directClassName?.includes("bound")) {
      return directClassName.split(" ")[1];
    }

    return "Unknown";
  }
  private static getRoutesFromLayer(
    layer: any,
    basePath: string = ""
  ): RouteInfo[] {
    const routes: RouteInfo[] = [];
    const metadata = getAllMetadata();
    console.log("metadata", metadata);

    if (layer.route && layer.route.path) {
      const path = this.cleanRoutePath(basePath + layer.route.path);

      Object.keys(layer.route.methods).forEach((method) => {
        // Iterate through the stack to find the actual handler
        let routeMetadata;
        layer.route.stack.forEach((stackItem: any) => {
          if (
            stackItem.name !== "anonymous" &&
            stackItem.name !== "bound dispatch" &&
            stackItem.name !== "isAuthenticated"
          ) {
            const handler = stackItem.handle;
            const className = this.getHandlerClassName(handler);
            const methodName = stackItem.name;
            const key = `${className}.${methodName}`;
            routeMetadata = metadata[key];
            console.log(`key: ${key}, metadata: ${routeMetadata}`);
          }
        });

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
    const routeStack = app._router.stack;
    for (const layer of routeStack) {
      routes.push(...this.getRoutesFromLayer(layer));
    }
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
