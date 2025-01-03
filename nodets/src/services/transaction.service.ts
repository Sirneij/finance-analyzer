import { FileUploadResult } from "$types/transaction.types.ts";
import mongoose from "mongoose";
import { ParserFactory } from "utils/file.utils.ts";

export class UploadService {
  static async processFile(
    buffer: Buffer,
    mimeType: string,
    userId: mongoose.Types.ObjectId
  ): Promise<FileUploadResult> {
    if (!ParserFactory.isSupportedType(mimeType)) {
      throw new Error("Unsupported file type");
    }

    const parser = ParserFactory.getParser(mimeType, userId);
    const transactions = await parser.parse(buffer);

    return {
      transactions,
      mimeType,
    };
  }
}
