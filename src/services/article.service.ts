import { ArticleModel } from "$models/article.model.js";
import {
  CreateArticleInput,
  IArticlePopulated,
  IArticleSeries,
  ITag,
  SearchQuery,
  UpdateArticleInput,
} from "$types/article.types.js";
import { cleanQuery } from "$utils/article.utils.js";
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

      const queryParams = { isPublished: true };

      const query = ArticleModel.find(queryParams)
        .populate<{ tags: ITag[] }>("tags")
        .populate<{ series: IArticleSeries }>("series")
        .sort({ createdAt: -1 })
        .skip(skip);

      if (!shouldFetchAll) {
        query.limit(limit);
      }

      const [articles, total] = await Promise.all([
        query.lean().exec(),
        ArticleModel.countDocuments(query),
      ]);

      return {
        articles,
        total,
        page: shouldFetchAll ? 1 : page,
        limit: shouldFetchAll ? total : limit,
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

      const query = ArticleModel.find()
        .populate<{ tags: ITag[] }>("tags")
        .populate<{ series: IArticleSeries }>("series")
        .sort({ createdAt: -1 })
        .skip(skip);

      if (!shouldFetchAll) {
        query.limit(limit);
      }

      const [articles, total] = await Promise.all([
        query.lean().exec(),
        ArticleModel.countDocuments(query),
      ]);

      return {
        articles,
        total,
        page: shouldFetchAll ? 1 : page,
        limit: shouldFetchAll ? total : limit,
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
      };

      // Clean query by removing empty values
      const query = cleanQuery(baseQuery);

      const shouldFetchAll = limit === -1;
      const skip = shouldFetchAll ? 0 : (page - 1) * limit;

      const articlesQuery = ArticleModel.find(query)
        .populate<{ tags: ITag[] }>("tags")
        .populate<{ series: IArticleSeries }>("series")
        .sort(sortBy === "popular" ? { views: -1 } : { createdAt: -1 })
        .skip(skip);

      if (!shouldFetchAll) {
        articlesQuery.limit(limit);
      }

      const [articles, total] = await Promise.all([
        articlesQuery.lean().exec(),
        ArticleModel.countDocuments(query),
      ]);

      return {
        articles,
        total,
        page: shouldFetchAll ? 1 : page,
        limit: shouldFetchAll ? total : limit,
      };
    } catch (error) {
      console.error("Error in searchArticles:", error);
      throw error;
    }
  }
}
