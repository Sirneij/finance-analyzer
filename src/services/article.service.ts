import { ArticleModel } from "$models/article.model.js";
import {
  CreateArticleInput,
  IArticlePopulated,
  IArticleSeries,
  ITag,
  SearchQuery,
  UpdateArticleInput,
} from "$types/article.types.js";
import { cleanQuery, deleteFilesFromCloudinary } from "$utils/article.utils.js";
import { Types } from "mongoose";

export class ArticleService {
  static async getArticleById(
    id: string,
    incrementViews: boolean = false
  ): Promise<IArticlePopulated | null> {
    try {
      if (incrementViews) {
        await ArticleModel.findByIdAndUpdate(
          id,
          { $inc: { views: 1 } },
          { new: true }
        );
      }
      const article = await ArticleModel.findById({ _id: id })
        .populate<{ tags: ITag[] }>("tags")
        .populate<{ series: IArticleSeries }>("series")
        .lean()
        .exec();
      return article;
    } catch (error) {
      console.error("Error in getArticleById:", error);
      throw error;
    }
  }

  static async getPublishedArticles(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    articles: IArticlePopulated[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const shouldFetchAll = limit === -1;
      const skip = shouldFetchAll ? 0 : (page - 1) * limit;

      const [result] = await ArticleModel.aggregate([
        { $match: { isPublished: true } },
        {
          $facet: {
            articles: [
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              ...(!shouldFetchAll ? [{ $limit: limit }] : []),
              {
                $lookup: {
                  from: "tags",
                  localField: "tags",
                  foreignField: "_id",
                  as: "tags",
                },
              },
              {
                $lookup: {
                  from: "series",
                  localField: "series",
                  foreignField: "_id",
                  as: "series",
                },
              },
              {
                $addFields: {
                  series: { $arrayElemAt: ["$series", 0] },
                },
              },
            ],
            total: [{ $count: "count" }],
          },
        },
      ]);

      return {
        articles: result.articles || [],
        total: result.total[0]?.count || 0,
        page: shouldFetchAll ? 1 : page,
        limit: shouldFetchAll ? result.total[0]?.count || 0 : limit,
      };
    } catch (error) {
      throw new Error(`Failed to fetch articles: ${error}`);
    }
  }

  static async createArticle(articleData: CreateArticleInput) {
    try {
      const article = await ArticleModel.create(articleData);
      return article;
    } catch (error) {
      console.error("Error in createArticle:", error);
      throw error;
    }
  }

  static async updateArticle(
    id: string,
    articleData: Partial<UpdateArticleInput>
  ) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid article ID");
      }

      const article = await ArticleModel.findByIdAndUpdate(
        id,
        { $set: articleData },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("tags")
        .populate("series")
        .exec();

      if (!article) {
        throw new Error("Article not found");
      }

      return article;
    } catch (error) {
      console.error("Error in updateArticle:", error);
      throw error;
    }
  }

  static async deleteArticle(id: string) {
    try {
      const article = await ArticleModel.findByIdAndDelete({ _id: id }).exec();
      return article;
    } catch (error) {
      console.error("Error in deleteArticle:", error);
      throw error;
    }
  }

  static async getAllArticles(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    articles: IArticlePopulated[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const shouldFetchAll = limit === -1;
      const skip = shouldFetchAll ? 0 : (page - 1) * limit;

      const [result] = await ArticleModel.aggregate([
        {
          $facet: {
            articles: [
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              ...(!shouldFetchAll ? [{ $limit: limit }] : []),
              {
                $lookup: {
                  from: "tags",
                  localField: "tags",
                  foreignField: "_id",
                  as: "tags",
                },
              },
              {
                $lookup: {
                  from: "series",
                  localField: "series",
                  foreignField: "_id",
                  as: "series",
                },
              },
              {
                $addFields: {
                  series: { $arrayElemAt: ["$series", 0] },
                },
              },
            ],
            total: [{ $count: "count" }],
          },
        },
      ]);

      return {
        articles: result.articles || [],
        total: result.total[0]?.count || 0,
        page: shouldFetchAll ? 1 : page,
        limit: shouldFetchAll ? result.total[0]?.count || 0 : limit,
      };
    } catch (error) {
      console.error("Error in getAllArticles:", error);
      throw error;
    }
  }
  static async searchArticles(
    params: SearchQuery,
    isJohnOwolabiIdogun: boolean
  ): Promise<{
    articles: IArticlePopulated[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const {
        q,
        tags,
        series,
        sortBy = "recent",
        period,
        page = 1,
        limit = 10,
      } = params;

      // Build date filter
      let dateFilter = {};
      if (period) {
        const now = new Date();
        const startDate = new Date();
        switch (period) {
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        dateFilter = { createdAt: { $gte: startDate } };
      }

      // Build base query with null checks
      const baseQuery = {
        ...(Object.keys(dateFilter).length > 0 && dateFilter),
        ...(tags && tags.length > 0 && { tags: { $in: tags } }),
        ...(series &&
          Types.ObjectId.isValid(series) && {
            series: new Types.ObjectId(series),
          }),
        ...(!isJohnOwolabiIdogun && { isPublished: true }),
        ...(q && {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { content: { $regex: q, $options: "i" } },
          ],
        }),
      };

      // Clean query by removing empty values
      const query = cleanQuery(baseQuery);

      const shouldFetchAll = limit === -1;
      const skip = shouldFetchAll ? 0 : (page - 1) * limit;

      const [result] = await ArticleModel.aggregate([
        { $match: query },
        {
          $facet: {
            articles: [
              {
                $sort: sortBy === "popular" ? { views: -1 } : { createdAt: -1 },
              },
              { $skip: skip },
              ...(!shouldFetchAll ? [{ $limit: limit }] : []),
              {
                $lookup: {
                  from: "tags",
                  localField: "tags",
                  foreignField: "_id",
                  as: "tags",
                },
              },
              {
                $lookup: {
                  from: "series",
                  localField: "series",
                  foreignField: "_id",
                  as: "series",
                },
              },
              {
                $addFields: {
                  series: { $arrayElemAt: ["$series", 0] },
                },
              },
            ],
            total: [{ $count: "count" }],
          },
        },
      ]);

      return {
        articles: result.articles || [],
        total: result.total[0]?.count || 0,
        page: shouldFetchAll ? 1 : page,
        limit: shouldFetchAll ? result.total[0]?.count || 0 : limit,
      };
    } catch (error) {
      console.error("Error in searchArticles:", error);
      throw error;
    }
  }

  static async getArticleStats(): Promise<{
    totalArticles: number;
    totalViews: number;
    totalReactions: number;
  }> {
    try {
      const [stats] = await ArticleModel.aggregate([
        {
          $group: {
            _id: null,
            totalArticles: { $sum: 1 },
            totalViews: { $sum: { $ifNull: ["$views", 0] } },
          },
        },
        {
          $project: {
            _id: 0,
            totalArticles: 1,
            totalViews: 1,
          },
        },
      ]);

      return {
        totalArticles: stats?.totalArticles || 0,
        totalViews: stats?.totalViews || 0,
        totalReactions: 0,
      };
    } catch (error) {
      console.error("Error in getArticleStats:", error);
      throw error;
    }
  }

  static async deleteManyArticles(ids: string[]) {
    try {
      // Validate IDs
      const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
      if (validIds.length !== ids.length) {
        throw new Error("Invalid article ID(s) provided");
      }

      // Convert strings to ObjectIds
      const objectIds = validIds.map((id) => new Types.ObjectId(id));

      // Find articles with their foreImage paths
      const articles = await ArticleModel.find({ _id: { $in: objectIds } });

      if (articles.length !== ids.length) {
        throw new Error("Some articles do not exist");
      }

      // Delete foreImages if they exist
      const foreImages = articles.map((article) => article.foreImage || "");

      const deleteForeimages = await deleteFilesFromCloudinary(foreImages);

      // Delete all articles
      const deletedArticles = await ArticleModel.deleteMany({
        _id: { $in: objectIds },
      }).exec();

      return {
        deletedArticles,
        deleteForeimages,
      };
    } catch (error) {
      console.error("Error in deleteManyArticles:", error);
      throw error;
    }
  }
}
