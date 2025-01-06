import { parse } from "csv-parse";
import { BaseParser } from "$utils/file.utils.ts";
import { ITransaction } from "$types/transaction.types.ts";
import { baseConfig } from "$config/base.config.ts";

export class CSVParser extends BaseParser {
  private readonly CHASE_COLUMNS = {
    details: /\b(details)\b/i,
    postingDate: /\b(posting[\s_-]?date)\b/i,
    description: /\b(description)\b/i,
    amount: /\b(amount)\b/i,
    type: /\b(type)\b/i,
    balance: /\b(balance)\b/i,
  };

  private cleanDescription(description: string): string {
    if (!description) return "Unknown Transaction";

    // Remove extra spaces
    let cleaned = description.replace(/\s+/g, " ").trim();

    // Remove location patterns
    cleaned = cleaned.replace(/\s+[A-Z]{2}\s*\d*$/, "");
    cleaned = cleaned.replace(/\s+\d{6}$/, "");

    // Remove date patterns
    cleaned = cleaned.replace(/\s+\d{2}\/\d{2}$/, "");

    // Remove special characters but keep basic punctuation
    cleaned = cleaned.replace(/[^\w\s-.,&()]/g, "");

    return cleaned || "Unknown Transaction";
  }

  private normalizeAmount(amount: string): number {
    // Convert string amount to number, preserving negative signs
    const value = parseFloat(amount.replace(/[^\d.-]/g, ""));
    return isNaN(value) ? 0 : value;
  }

  async parse(buffer: Buffer): Promise<Partial<ITransaction>[]> {
    return new Promise((resolve, reject) => {
      const transactions: Partial<ITransaction>[] = [];

      parse(buffer, {
        columns: true,
        trim: true,
        relax_column_count: true, // Allow inconsistent column counts
        skip_empty_lines: true,
        relax_quotes: true,
      })
        .on("data", (row) => {
          try {
            const transactionType = row.Type.toLowerCase().includes("credit")
              ? "income"
              : "expense";
            const transaction = {
              userId: this.userId,
              date: new Date(row.Details ? row["Posting Date"] : Date.now()),
              amount: this.normalizeAmount(row.Amount),
              description: this.cleanDescription(row.Description),
              balance: row.Balance ? Number(row.Balance) : 0,
              type: transactionType as "income" | "expense",
            };

            if (!isNaN(transaction.amount)) {
              transactions.push(transaction);
            }
          } catch (error) {
            baseConfig.logger.warn("Invalid row", { row, error });
          }
        })
        .on("end", () => {
          if (transactions.length === 0) {
            return reject(new Error("No valid transactions found"));
          }
          baseConfig.logger.info(`Parsed ${transactions.length} transactions`);
          resolve(transactions);
        })
        .on("error", (error) => {
          baseConfig.logger.error("CSV parse error", error);
          reject(error);
        });
    });
  }
}
