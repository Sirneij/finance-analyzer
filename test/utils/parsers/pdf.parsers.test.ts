// pdf.parsers.test.js
import { PDFParser } from "$utils/parsers/pdf.parsers.js";
import { ITransaction } from "$types/transaction.types.js";
import mongoose from "mongoose";

global.fetch = jest.fn();

describe("PDFParser", () => {
  let parser: PDFParser;

  beforeEach(() => {
    parser = new PDFParser(new mongoose.Types.ObjectId());
    (global.fetch as jest.Mock).mockReset();
  });

  it("should parse transactions correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        text: `March 01, 2023 through\n02/28 Test Transaction   9.99   100.50\n02/28 Another Purchase  - 15.99  84.51\n`,
      }),
    });

    const buffer = Buffer.from("fake-pdf-data");
    const results = await parser.parse(buffer);

    expect(results.length).toBe(2);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const transaction1 = results[0] as ITransaction;
    expect(transaction1.date.toISOString()).toBe("2023-02-28T05:00:00.000Z");
    expect(transaction1.description).toBe("Test Transaction");
    expect(transaction1.amount).toBe(9.99);
    expect(transaction1.balance).toBe(100.5);
    expect(transaction1.type).toBe("income");

    const transaction2 = results[1] as ITransaction;
    expect(transaction2.amount).toBe(-15.99);
    expect(transaction2.type).toBe("expense");
  });
});
