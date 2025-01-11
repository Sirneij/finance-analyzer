// csv.parsers.test.ts
import { CSVParser } from "$utils/parsers/csv.parsers.ts";
import { ITransaction } from "$types/transaction.types.ts";
import { PassThrough } from "stream";
import mongoose from "mongoose";
import { baseConfig } from "$config/base.config.ts";

describe("CSVParser", () => {
  let parser: CSVParser;

  beforeEach(() => {
    parser = new CSVParser(new mongoose.Types.ObjectId());
  });

  it("should parse valid CSV rows into transactions", async () => {
    const csvData = `Type,Amount,Description,Balance,Posting Date
Credit,12.34,Some Description,100.56,01/02/2023
Debit,-23.45,Another Description,77.11,01/03/2023
`;

    const buffer = Buffer.from(csvData, "utf-8");
    const transactions = await parser.parse(buffer);

    expect(transactions.length).toBe(2);

    const t1 = transactions[0] as ITransaction;
    expect(t1.amount).toBe(12.34);
    expect(t1.type).toBe("income");
    expect(t1.description).toBe("Some Description");
    expect(t1.balance).toBe(100.56);

    const t2 = transactions[1] as ITransaction;
    expect(t2.amount).toBe(-23.45);
    expect(t2.type).toBe("expense");
    expect(t2.description).toBe("Another Description");
    expect(t2.balance).toBe(77.11);
  });

  it("should reject if no valid transactions found", async () => {
    const emptyCSV = "Type,Amount,Description,Balance\n";
    const buffer = Buffer.from(emptyCSV, "utf-8");

    await expect(parser.parse(buffer)).rejects.toThrow(
      "No valid transactions found"
    );
  });

  it("should handle parse errors", async () => {
    // Create stream that emits invalid data
    const invalidDataStream = new PassThrough();
    invalidDataStream.write('"Unclosed quote, something');
    invalidDataStream.end();

    const buffer: Buffer = Buffer.from("");
    // Overwrite buffer's prototype to act like a stream error
    (buffer as any).pipe = () => invalidDataStream;

    await expect(parser.parse(buffer)).rejects.toThrow();
  });
});

describe("CSVParser Error Handling", () => {
  let parser: CSVParser;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    parser = new CSVParser(new mongoose.Types.ObjectId());
    loggerWarnSpy = jest
      .spyOn(baseConfig.logger, "warn")
      .mockImplementation((infoObject: object) => baseConfig.logger);

    loggerErrorSpy = jest
      .spyOn(baseConfig.logger, "error")
      .mockImplementation((infoObject: object) => baseConfig.logger);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should catch row parsing errors and log a warning", async () => {
    // Force an error in the 'data' handler by missing a required field
    const invalidCSV = `Type,Amount,Balance\ncredit,,100\n`;
    const buffer = Buffer.from(invalidCSV, "utf-8");

    await expect(parser.parse(buffer)).rejects.toThrow(
      "Missing required fields"
    );
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      "Error parsing CSV",
      expect.any(Object)
    );
  });
});
