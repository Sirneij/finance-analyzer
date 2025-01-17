import { IFileParser } from "$types/files.types.js";
import { Resume } from "$types/resume.types.js";
import { ITransaction, RawTransaction } from "$types/transaction.types.js";
import mongoose from "mongoose";

export abstract class BaseParser implements IFileParser {
  constructor(protected userId: mongoose.Types.ObjectId) {}

  abstract parse(
    buffer: Buffer,
    name: string
  ): Promise<Partial<ITransaction>[] | Resume>;

  protected mapToTransaction(raw: RawTransaction): Partial<ITransaction> {
    return {
      userId: this.userId as mongoose.Types.ObjectId,
      date: new Date(raw.date),
      amount: Number(raw.amount),
      balance: raw.balance ? Number(raw.balance) : undefined,
      description: raw.description,
      type: raw.type.toLowerCase() === "income" ? "income" : "expense",
    };
  }
}
