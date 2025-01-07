export interface RouteMetadata {
  description: string;
  responses: {
    [key: string]: { description: string };
  };
}

export interface RouteInfo {
  path: string;
  method: string;
  middlewares: string[];
  metadata?: RouteMetadata;
}
