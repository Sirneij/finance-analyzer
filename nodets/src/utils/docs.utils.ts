import "reflect-metadata";
import { RouteMetadata } from "$types/docs.types.ts";

const ROUTE_METADATA_KEY = Symbol("routeDoc");
const metadataMap = new Map<string, RouteMetadata>();

export function RouteDoc(options: RouteMetadata) {
  return function (target: any, propertyKey: string) {
    const className = target.constructor.name;
    metadataMap.set(`${className}.${propertyKey}`, options);
  };
}

export function getAllMetadata(): Map<string, RouteMetadata> {
  return metadataMap;
}
