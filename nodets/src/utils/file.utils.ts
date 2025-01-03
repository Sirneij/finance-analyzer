import { IFileParser, SupportedFileTypes } from "$types/files.types.ts";
import { ITransaction, RawTransaction } from "$types/transaction.types.ts";
import mongoose from "mongoose";
import pdf from "pdf-parse";

export abstract class BaseParser implements IFileParser {
  constructor(protected userId: mongoose.Types.ObjectId) {}

  abstract parse(buffer: Buffer): Promise<Partial<ITransaction>[]>;

  protected mapToTransaction(raw: RawTransaction): Partial<ITransaction> {
    return {
      userId: this.userId,
      date: new Date(raw.date),
      amount: Number(raw.amount),
      balance: Number(raw.balance),
      category: raw.category || "uncategorized",
      description: raw.description,
      type: raw.type.toLowerCase() === "income" ? "income" : "expense",
    };
  }
}

export class PDFParser extends BaseParser {
  private static readonly TRANSACTION_PATTERN =
    /(\d{2}[-/]\d{2}[-/]\d{4})\s+([-]?\d+\.?\d*)\s+([^0-9]+?)\s+([-]?\d+\.?\d*)/;

  async parse(buffer: Buffer): Promise<Partial<ITransaction>[]> {
    const data = await pdf(buffer);
    const lines = data.text.split("\n").filter((line) => line.trim());
    const transactions: Partial<ITransaction>[] = [];

    for (const line of lines) {
      const match = line.match(PDFParser.TRANSACTION_PATTERN);
      if (match) {
        const [, date, amount, description, balance] = match;
        transactions.push(
          this.mapToTransaction({
            userId: this.userId,
            date,
            amount,
            description: description.trim(),
            balance,
            type: Number(amount) >= 0 ? "income" : "expense",
          })
        );
      }
    }

    return transactions;
  }
}

export class ParserFactory {
  static getParser(
    mimeType: SupportedFileTypes,
    userId: mongoose.Types.ObjectId
  ): IFileParser {
    switch (mimeType) {
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
