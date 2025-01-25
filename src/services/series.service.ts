import { ArticleSeriesModel } from "$models/article.model.js";
import {
  CreateArticleSeriesInput,
  IArticleSeries,
} from "$types/article.types.js";
import { Error } from "mongoose";

export class SeriesService {
  static async getSeriesById(id: string): Promise<IArticleSeries | null> {
    try {
      const series = await ArticleSeriesModel.findById({ _id: id })
        .lean()
        .exec();
      return series;
    } catch (error) {
      console.error("Error in getSeriesById:", error);
      throw error;
    }
  }

  static async getSeries(): Promise<IArticleSeries[]> {
    try {
      const series = await ArticleSeriesModel.find().lean().exec();
      return series;
    } catch (error) {
      console.error("Error in getSeries:", error);
      throw error;
    }
  }

  static async createSeries(data: CreateArticleSeriesInput[]) {
    try {
      const series = await ArticleSeriesModel.insertMany(data);
      return series;
    } catch (error) {
      console.error("Error in createSeries:", error);
      throw error;
    }
  }

  static async findOneOrCreate(data: {
    title: string;
  }): Promise<IArticleSeries> {
    try {
      // Use findOneAndUpdate with upsert to handle race conditions
      const series = await ArticleSeriesModel.findOneAndUpdate(
        { title: data.title },
        { $setOnInsert: { title: data.title } },
        {
          upsert: true, // Create if not exists
          new: true, // Return modified document
          runValidators: true, // Run model validations
        }
      );

      if (!series) {
        throw new Error("Failed to find or create series");
      }

      return series;
    } catch (error) {
      // Type guard to check if error is a MongoError
      if (error instanceof Error && "code" in error && error.code === 11000) {
        // Handle duplicate key error
        const existingSeries = await ArticleSeriesModel.findOne({
          title: data.title,
        });
        if (!existingSeries) {
          throw new Error(
            "Failed to find existing series after duplicate key error"
          );
        }
        return existingSeries;
      }
      // Re-throw other errors
      throw error;
    }
  }
}
