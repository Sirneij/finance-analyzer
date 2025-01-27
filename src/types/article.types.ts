import mongoose, { Document } from "mongoose";

export interface IArticleSeries extends Document {
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITag extends Document {
  name: string;
  description?: string;
}

export interface IArticle extends Document {
  foreImage?: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  language: string;
  views: number;
  series?: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
}

export interface IArticlePopulated extends Omit<IArticle, "series" | "tags"> {
  series?: IArticleSeries;
  tags: ITag[];
}

export interface CreateArticleInput {
  foreImage?: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  series?: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
}

export interface UpdateArticleInput {
  foreImage?: string;
  title?: string;
  slug?: string;
  content?: string;
  isPublished?: boolean;
  series?: mongoose.Types.ObjectId;
  tags?: mongoose.Types.ObjectId[];
}

export interface PaginatedArticles {
  articles: IArticlePopulated[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTagInput {
  name: string;
  description: string;
}

export interface UpdateTagInput {
  name?: string;
  description?: string;
}

export interface CreateArticleSeriesInput {
  title: string;
}

export interface SearchQuery {
  tags?: string[] | mongoose.Types.ObjectId[];
  series?: string;
  sortBy: "popular" | "recent";
  period?: "week" | "month" | "year";
  page: number;
  limit: number;
}
