import { TagModel } from "$models/article.model.js";
import { CreateTagInput, ITag } from "$types/article.types.js";

export class TagsService {
  static async getTagById(id: string): Promise<ITag | null> {
    try {
      const tag = await TagModel.findById({ _id: id }).lean().exec();
      return tag;
    } catch (error) {
      console.error("Error in getTagById:", error);
      throw error;
    }
  }
  static async getTags(page: number, limit: number) {
    try {
      const shouldFetchAll = limit === -1;
      const skip = shouldFetchAll ? 0 : (page - 1) * limit;

      const query = TagModel.find().sort({ createdAt: -1 }).skip(skip);

      if (!shouldFetchAll) {
        query.limit(limit);
      }

      const [tags, total] = await Promise.all([
        query.lean().exec(),
        TagModel.countDocuments(),
      ]);
      return {
        tags,
        total,
        page: shouldFetchAll ? 1 : page,
        limit: shouldFetchAll ? total : limit,
      };
    } catch (error) {
      console.error("Error in getTags:", error);
      throw error;
    }
  }

  static async createTags(data: CreateTagInput[]) {
    try {
      const tags = await TagModel.insertMany(data);
      return tags;
    } catch (error) {
      console.error("Error in createTag:", error);
      throw error;
    }
  }

  static async deleteTag(id: string) {
    try {
      await TagModel.deleteOne({ _id: id }).exec();
    } catch (error) {
      console.error("Error in deleteTag:", error);
      throw error;
    }
  }

  static async updateTag(id: string, data: Partial<CreateTagInput>) {
    try {
      const tag = await TagModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      ).exec();
      return tag;
    } catch (error) {
      console.error("Error in updateTag:", error);
      throw error;
    }
  }

  static async getTagsByName(names: string[]): Promise<ITag[]> {
    try {
      const tags = await TagModel.find({ name: { $in: names } })
        .lean()
        .exec();
      return tags;
    } catch (error) {
      console.error("Error in getTagsByName:", error);
      throw error;
    }
  }
}
