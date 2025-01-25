import { SeriesService } from "$services/series.service.js";
import { TagsService } from "$services/tags.service.js";
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
