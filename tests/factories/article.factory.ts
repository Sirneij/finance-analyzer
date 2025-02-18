import { faker } from "@faker-js/faker";
import type { CreateArticleInput } from "$types/article.types";
import mongoose from "mongoose";

export const createTag = (override: Partial<any> = {}) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: faker.lorem.word(),
    ...override,
  };
};

export const createArticleInput = (
  override: Partial<CreateArticleInput> = {}
): CreateArticleInput => {
  const title = faker.lorem.sentence();
  const slug = faker.helpers.slugify(title).toLowerCase();
  const tags = createTag();
  return {
    title: title,
    slug: slug,
    foreImage: faker.image.url(),
    content: faker.lorem.paragraphs(3),
    tags: [tags._id],
    series: new mongoose.Types.ObjectId(),
    isPublished: faker.datatype.boolean(),
    ...override,
  };
};

export const createArticleResponse = (override: Partial<any> = {}) => {
  return {
    _id: new mongoose.Types.ObjectId().toString(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    views: faker.number.int({ min: 0, max: 1000 }),
    ...createArticleInput(),
    ...override,
  };
};

export const createPaginatedArticleResponse = (count: number = 3) => {
  const articles = Array.from({ length: count }, () => createArticleResponse());
  return {
    articles,
    total: faker.number.int({ min: count, max: 100 }),
    page: faker.number.int({ min: 1, max: 5 }),
    limit: faker.number.int({ min: 10, max: 50 }),
  };
};
