import { baseConfig } from "$config/base.config.ts";
import { IFileParser, SupportedFileTypes } from "$types/files.types.ts";
import { ITransaction, RawTransaction } from "$types/transaction.types.ts";
import mongoose from "mongoose";

export abstract class BaseParser implements IFileParser {
  constructor(protected userId: mongoose.Types.ObjectId) {}

  abstract parse(buffer: Buffer): Promise<Partial<ITransaction>[]>;

  protected mapToTransaction(raw: RawTransaction): Partial<ITransaction> {
    return {
      userId: this.userId,
      date: new Date(raw.date),
      amount: Number(raw.amount),
      balance: Number(raw.balance),
      description: raw.description,
      type: raw.type.toLowerCase() === "income" ? "income" : "expense",
    };
  }
}

export class PDFParser extends BaseParser {
  private static readonly TRANSACTION_PATTERN =
    /(\d{2}\/\d{2})(?!.*Page)\s*([^-\d].*?)\s*(-\s*|\s+)?(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2})\s*([\d,]+\.\d{2})?/;

  async parse(buffer: Buffer): Promise<Partial<ITransaction>[]> {
    const formData = new FormData();
    formData.append("file", new Blob([buffer]), "document.pdf");

    const response = await fetch(
      `${baseConfig.utility_service_url}/extract-text`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    const extractedText = data.text;

    const lines = extractedText.split("\n");

    const transactions: Partial<ITransaction>[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = PDFParser.TRANSACTION_PATTERN.exec(line);

      if (match) {
        const [, date, description, negative, whole, decimal, balance] = match;
        const amountStr = `${negative || ""}${whole}.${decimal}`;
        const parsedAmount = parseFloat(amountStr.replace(/[\s,]/g, ""));
        const parsedBalance = balance
          ? parseFloat(balance.replace(/,/g, ""))
          : 0.0;

        transactions.push(
          this.mapToTransaction({
            userId: this.userId,
            date,
            description: description.trim(),
            amount: parsedAmount,
            balance: parsedBalance,
            type: parsedAmount < 0 ? "expense" : "income",
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
