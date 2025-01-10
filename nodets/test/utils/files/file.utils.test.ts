import { BaseParser } from "$utils/file.utils.ts";
import mongoose from "mongoose";
import { RawTransaction } from "$types/transaction.types.ts";

// file.utils.test.ts
describe("Sample Test file.utils.test.ts", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
class TestParser extends BaseParser {
  async parse() {
    return [];
  }

  // Expose protected method for testing
  public testMapToTransaction(raw: RawTransaction) {
    return this.mapToTransaction(raw);
  }
}

describe("BaseParser", () => {
  let parser: TestParser;
  let userId: mongoose.Types.ObjectId;

  beforeEach(() => {
    userId = new mongoose.Types.ObjectId();
    parser = new TestParser(userId);
  });

  describe("mapToTransaction", () => {
    it("should map complete transaction data correctly", () => {
      const raw: RawTransaction = {
        userId: userId,
        date: "2023-01-01",
        amount: 100.5,
        balance: 500.75,
        description: "Test transaction",
        type: "income",
      };

      const result = parser.testMapToTransaction(raw);

      expect(result).toEqual({
        userId,
        date: new Date("2023-01-01"),
        amount: 100.5,
        balance: 500.75,
        description: "Test transaction",
        type: "income",
      });
    });

    it("should handle missing balance", () => {
      const raw: RawTransaction = {
        userId: userId,
        date: "2023-01-01",
        amount: 100.5,
        balance: 0,
        description: "Test transaction",
        type: "expense",
      };

      const result = parser.testMapToTransaction(raw);

      expect(result.balance).toBeUndefined();
    });

    it("should convert type to income when 'INCOME'", () => {
      const raw: RawTransaction = {
        userId: userId,
        date: "2023-01-01",
        amount: 100,
        description: "Test income",
        type: "INCOME",
        balance: 0,
      };

      const result = parser.testMapToTransaction(raw);

      expect(result.type).toBe("income");
    });

    it("should convert type to expense for non-income values", () => {
      const raw: RawTransaction = {
        userId: userId,
        date: "2023-01-01",
        amount: 100,
        balance: 0,
        description: "Test expense",
        type: "something",
      };

      const result = parser.testMapToTransaction(raw);

      expect(result.type).toBe("expense");
    });
  });
});
