import { ITransaction } from "$types/transaction.types.js";

export type SupportedFileTypes =
  | "text/csv"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/pdf"
  | "image/jpeg"
  | "image/png";

export interface IFileParser {
  parse(buffer: Buffer): Promise<Partial<ITransaction>[]>;
}
