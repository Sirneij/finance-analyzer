export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}
export type SupportedLanguage = "nodejs" | "python" | "go" | "rust";

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

export interface Endpoint {
  id: string;
  path: string;
  method: HttpMethod;
  middlewares: string[];
  category: string;
  description: string;
  parameters?: EndpointParameter[];
  responses: EndpointResponse[];
  examples: EndpointExample[];
  createdAt: Date;
  updatedAt: Date;
}

interface EndpointParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface EndpointResponse {
  status: number;
  description: string;
  example: Record<string, unknown>;
}

interface EndpointExample {
  language: SupportedLanguage;
  code: string;
}
