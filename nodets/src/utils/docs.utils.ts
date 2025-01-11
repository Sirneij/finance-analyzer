import "reflect-metadata";
import { RouteMetadata } from "$types/docs.types.ts";

const metadataMap: Record<string, RouteMetadata> = {};

export function RouteDoc(options: RouteMetadata) {
  return function (target: any, propertyKey: string) {
    const className = target.constructor.name;
    const key = `${className}.${propertyKey}`;
    metadataMap[key] = { ...options, className, methodName: propertyKey };
  };
}

export function getAllMetadata(): Record<string, RouteMetadata> {
  return metadataMap;
}
