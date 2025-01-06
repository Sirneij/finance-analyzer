import { IFileParser } from "$types/files.types.ts";
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
      balance: raw.balance ? Number(raw.balance) : undefined,
      description: raw.description,
      type: raw.type.toLowerCase() === "income" ? "income" : "expense",
    };
  }
}
