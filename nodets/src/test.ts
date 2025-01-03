import fs from "fs";
import pdfParse from "pdf-parse";
import { promises as fsPromises } from "fs";

interface Transaction {
  date: string;
  description: string;
  amount: number;
  balance?: number;
  category: "income" | "expense";
}

async function extractTransactionsFromPDF(
  filePath: string
): Promise<[Transaction[], string]> {
  const pdfBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(pdfBuffer);

  const transactionPattern =
    /(\d{2}\/\d{2})(?!.*Page)\s*([^-\d].*?)\s*([-]?\s*\d+(?:,\d{3})*\.\d{2})\s*([\d,]+\.\d{2})?/;

  const transactions: Transaction[] = [];
  const lines = data.text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = transactionPattern.exec(line);

    if (match) {
      const [, date, description, amount, balance] = match;
      const parsedAmount = parseFloat(amount.replace(/[\s,]/g, ""));
      const parsedBalance = balance
        ? parseFloat(balance.replace(/,/g, ""))
        : undefined;

      transactions.push({
        date,
        description: description.trim(),
        amount: parsedAmount,
        balance: parsedBalance,
        category: parsedAmount < 0 ? "expense" : "income",
      });
    }
  }

  return [transactions, data.text];
}

// Example usage
const filePath = "./src/test.pdf";

extractTransactionsFromPDF(filePath)
  .then(async (data) => {
    const [transactions, text] = data;
    try {
      await fsPromises.writeFile(
        "./test.json",
        JSON.stringify(transactions, null, 2)
      );
      await fsPromises.writeFile("./test.txt", text);
      console.log("Transactions written to test.json");
      console.log(`Total Transactions: ${transactions.length}`);
    } catch (err) {
      console.error("Error writing file:", err);
    }
  })
  .catch((err) => console.error("Error extracting transactions:", err));
