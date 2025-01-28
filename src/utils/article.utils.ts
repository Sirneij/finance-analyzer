import { SeriesService } from "$services/series.service.js";
import { TagsService } from "$services/tags.service.js";
import { SearchQuery } from "$types/article.types.js";
import { createHash } from "crypto";
import { Types } from "mongoose";

export const getPublicId = (cloudinaryUrl: string): string => {
  try {
    // Split URL by '/'
    const parts = cloudinaryUrl.split("/");

    // Find version number index (starts with 'v')
    const versionIndex = parts.findIndex((part) => part.startsWith("v"));

    // Get everything after version number and before extension
    const publicIdParts = parts.slice(versionIndex + 1);
    const lastPart = publicIdParts[publicIdParts.length - 1];
    const nameWithoutExt = lastPart.split(".")[0];

    // Join path parts
    return [...publicIdParts.slice(0, -1), nameWithoutExt].join("/");
  } catch (error) {
    throw new Error("Invalid Cloudinary URL format");
  }
};

const generateSlug = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    // Remove accents
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Replace special characters with space
    .replace(/[^a-z0-9\s-]/g, " ")
    // Replace spaces with hyphens
    .replace(/\s+/g, "-")
    // Replace multiple hyphens with a single hyphen
    .replace(/-+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "");

  const timestamp = Date.now();
  const hash = createHash("md5")
    .update(baseSlug + timestamp.toString())
    .digest("hex")
    .substring(0, 6);

  return `${baseSlug}-${hash}`; //.substring(0, 200);
};

export { generateSlug };

export const processTags = async (
  tags: string | Types.ObjectId[] | string[]
): Promise<Types.ObjectId[]> => {
  // Normalize input to string array
  const normalizedTags: string[] = Array.isArray(tags)
    ? tags.map((tag) => tag.toString().toLowerCase())
    : tags
        .toString()
        .toLowerCase()
        .split(",")
        .map((tag) => tag.trim());

  // Filter out empty strings
  const validTags = normalizedTags.filter((tag) => tag.length > 0);

  if (validTags.length === 0) {
    throw new Error("No valid tags provided");
  }

  // If all tags are valid ObjectIds, return them directly
  if (validTags.every((tag) => Types.ObjectId.isValid(tag))) {
    return validTags.map((tag) => new Types.ObjectId(tag));
  }

  // Otherwise, fetch tags by name
  const tagObjects = await TagsService.getTagsByName(validTags);

  if (tagObjects.length !== validTags.length) {
    const foundTags = tagObjects.map((tag) => tag.name);
    const missingTags = validTags.filter((tag) => !foundTags.includes(tag));
    throw new Error(`Invalid or missing tags: ${missingTags.join(", ")}`);
  }

  return tagObjects.map((tag) => tag._id as Types.ObjectId);
};

export const processSeriesTitle = async (
  title: string | Types.ObjectId
): Promise<Types.ObjectId> => {
  // If valid ObjectId, return it directly
  if (Types.ObjectId.isValid(title)) {
    return new Types.ObjectId(title.toString());
  }

  // Normalize title
  const normalizedTitle = title.toString().toLowerCase().trim();

  if (!normalizedTitle) {
    throw new Error("Invalid series title provided");
  }

  // Find existing series or create new one
  const series = await SeriesService.findOneOrCreate({
    title: normalizedTitle,
  });

  return series._id as Types.ObjectId;
};

export function parseQueryParams(query: any): SearchQuery {
  const parsedTags = query.tags
    ? Array.isArray(query.tags)
      ? query.tags
      : [query.tags]
    : undefined;

  const series =
    query.series && Types.ObjectId.isValid(query.series)
      ? query.series
      : undefined;

  return {
    tags: parsedTags,
    series,
    sortBy: query.sortBy === "popular" ? "popular" : "recent",
    period: ["week", "month", "year"].includes(query.period)
      ? query.period
      : undefined,
    page: Math.max(1, parseInt(query.page) || 1),
    limit: Math.max(1, Math.min(100, parseInt(query.limit) || 10)),
  };
}

export function cleanQuery(query: Record<string, any>): Record<string, any> {
  return Object.entries(query).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    if (Array.isArray(value) && value.length === 0) return acc;
    if (typeof value === "object" && Object.keys(value).length === 0)
      return acc;
    return { ...acc, [key]: value };
  }, {});
}
