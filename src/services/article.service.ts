import { ArticleModel } from "$models/article.model.js";
import {
  CreateArticleInput,
  IArticlePopulated,
  IArticleSeries,
  ITag,
  UpdateArticleInput,
} from "$types/article.types.js";
import { Types } from "mongoose";

export class ArticleService {
  static async getArticleById(id: string): Promise<IArticlePopulated | null> {
    try {
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

  static async getArticlesBySeries(
    seriesId: string
  ): Promise<IArticlePopulated[]> {
    try {
      const articles = await ArticleModel.find({
        series: seriesId,
        isPublished: true,
      })
        .populate<{ tags: ITag[] }>("tags")
        .populate<{ series: IArticleSeries }>("series")
        .lean()
        .exec();
      return articles;
    } catch (error) {
      console.error("Error in getArticlesBySeries:", error);
      throw error;
    }
  }

  static async getArticlesByTag(tagId: string): Promise<IArticlePopulated[]> {
    try {
      if (!Types.ObjectId.isValid(tagId)) {
        throw new Error("Invalid tag ID");
      }

      const articles = await ArticleModel.find({
        tags: { $in: [tagId] },
        isPublished: true,
      })
        .populate<{ tags: ITag[] }>("tags")
        .populate<{ series: IArticleSeries }>("series")
        .lean()
        .exec();
      return articles;
    } catch (error) {
      console.error("Error in getArticlesByTag:", error);
      throw error;
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
  ): Promise<IArticlePopulated[]> {
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

      const articles = await query.lean().exec();
      return articles;
    } catch (error) {
      console.error("Error in getAllArticles:", error);
      throw error;
    }
  }
}
