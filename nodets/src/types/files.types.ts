import { ITransaction } from "$types/transaction.types.js";
import { Resume } from "$types/resume.types.js";

export type SupportedFileTypes =
  | "text/csv"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/pdf"
  | "image/jpeg"
  | "image/png";

export interface IFileParser {
  parse(
    buffer: Buffer,
    name: string
  ): Promise<Partial<ITransaction>[] | Resume>;
}
