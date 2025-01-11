// factory.parsers.test.ts
import mongoose from "mongoose";
import { ParserFactory } from "$utils/parsers/factory.parsers.ts";
import { CSVParser } from "$utils/parsers/csv.parsers.ts";
import { PDFParser } from "$utils/parsers/pdf.parsers.ts";
import { SupportedFileTypes } from "$types/files.types.ts";

describe("ParserFactory", () => {
  const userId = new mongoose.Types.ObjectId();

  it("should return a CSVParser instance for text/csv", () => {
    const parser = ParserFactory.getParser("text/csv", userId);
    expect(parser).toBeInstanceOf(CSVParser);
  });

  it("should return a PDFParser instance for application/pdf", () => {
    const parser = ParserFactory.getParser("application/pdf", userId);
    expect(parser).toBeInstanceOf(PDFParser);
  });

  it("should throw an error for unsupported mime type", () => {
    expect(() =>
      ParserFactory.getParser("image/gif" as SupportedFileTypes, userId)
    ).toThrow("Unsupported file type: image/gif");
  });

  it("should correctly identify supported file types", () => {
    expect(ParserFactory.isSupportedType("text/csv")).toBe(true);
    expect(ParserFactory.isSupportedType("application/pdf")).toBe(true);
    expect(ParserFactory.isSupportedType("image/png")).toBe(true);
    expect(ParserFactory.isSupportedType("text/plain")).toBe(false);
  });
});
