import { IArticle, IArticleSeries, ITag } from "$types/article.types.js";
import mongoose, { Schema } from "mongoose";

// Schemas
const ArticleSeriesSchema = new Schema<IArticleSeries>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const TagSchema = new Schema<ITag>({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: String,
});

const ArticleSchema = new Schema<IArticle>(
  {
    foreImage: String,
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
    language: { type: String, default: "english" },
    series: { type: Schema.Types.ObjectId, ref: "ArticleSeries" },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Primary compound index for most common queries
ArticleSchema.index({
  isPublished: 1, // Equality filter first
  createdAt: -1, // Sort by date
  views: -1, // Sort by popularity
});

// Secondary indexes for other query patterns
ArticleSchema.index({ tags: 1, createdAt: -1 }); // For tag-based queries
ArticleSchema.index({ series: 1, createdAt: -1 }); // For series-based queries
ArticleSchema.index({ createdAt: -1 }); // For date range queries

// Models
export const ArticleSeriesModel = mongoose.model<IArticleSeries>(
  "ArticleSeries",
  ArticleSeriesSchema
);
export const TagModel = mongoose.model<ITag>("Tag", TagSchema);
export const ArticleModel = mongoose.model<IArticle>("Article", ArticleSchema);
