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
  series?: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
}
