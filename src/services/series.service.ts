import { ArticleSeriesModel } from "$models/article.model.js";
import type {
  CreateArticleSeriesInput,
  IArticleSeries,
  UpdateArticleSeriesInput,
} from "$types/article.types.js";
import { Error, Types } from "mongoose";

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

  static async getSeries(page: number = 1, limit: number = 10) {
    try {
      const shouldFetchAll = limit === -1;
      const skip = shouldFetchAll ? 0 : (page - 1) * limit;

      const query = ArticleSeriesModel.find()
        .sort({ createdAt: -1 })
        .skip(skip);

      if (!shouldFetchAll) {
        query.limit(limit);
      }

      const [series, total] = await Promise.all([
        query.lean().exec(),
        ArticleSeriesModel.countDocuments(),
      ]);

      return {
        series,
        total,
        page: shouldFetchAll ? 1 : page,
        limit: shouldFetchAll ? total : limit,
      };
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

  static async updateManySeries(data: UpdateArticleSeriesInput[]) {
    try {
      const bulkOps = data.map((update) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(update._id) },
          update: { $set: update },
        },
      }));

      const result = await ArticleSeriesModel.bulkWrite(bulkOps, {
        ordered: false,
      });

      return result;
    } catch (error) {
      console.error("Error in updateManySeries:", error);
      throw error;
    }
  }

  static async deleteManySeries(ids: string[]) {
    try {
      const result = await ArticleSeriesModel.deleteMany({
        _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
      });

      return result;
    } catch (error) {
      console.error("Error in deleteManySeries:", error);
      throw error;
    }
  }
}
