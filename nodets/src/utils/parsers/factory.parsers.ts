import mongoose from "mongoose";
import { IFileParser, SupportedFileTypes } from "$types/files.types.ts";
import { CSVParser } from "$utils/parsers/csv.parsers.ts";
import { PDFParser } from "$utils/parsers/pdf.parsers.ts";

export class ParserFactory {
  static getParser(
    mimeType: SupportedFileTypes,
    userId: mongoose.Types.ObjectId
  ): IFileParser {
    switch (mimeType) {
      case "text/csv":
        return new CSVParser(userId);
      case "application/pdf":
        return new PDFParser(userId);
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  static isSupportedType(mimeType: string): mimeType is SupportedFileTypes {
    return [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
      "image/jpeg",
      "image/png",
    ].includes(mimeType);
  }
}
