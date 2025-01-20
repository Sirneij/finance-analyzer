import fs from "fs";
import { promises as fsPromises } from "fs";

interface Transaction {
  date: Date;
  description: string;
  amount: number;
  balance?: number;
  category: "income" | "expense";
}

async function extractTransactionsFromPDF(
  filePath: string
): Promise<[Transaction[], string]> {
  const pdfBuffer = fs.readFileSync(filePath);
  const formData = new FormData();
  formData.append("file", new Blob([pdfBuffer]), "document.pdf");

  const response = await fetch("http://localhost:5173/extract-text", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  const extractedText = data.text;

  const transactions: Transaction[] = [];

  const transactionPattern =
    /(\d{2}\/\d{2})(?!.*Page)\s*([^-\d].*?)\s*(-\s*|\s+)?(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2})\s*([\d,]+\.\d{2})?/;

  const lines = extractedText.split("\n");

  const dateHeaderPattern = /([A-Za-z]+ \d{2}, (\d{4})) through/;
  let currentYear = new Date().getFullYear();

  // In the main loop
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const headerMatch = dateHeaderPattern.exec(line);
    if (headerMatch) {
      currentYear = parseInt(headerMatch[2]);
    }

    const match = transactionPattern.exec(line);
    if (match) {
      const [, date, description, negative, whole, decimal, balance] = match;
      const amountStr = `${negative || ""}${whole}.${decimal}`;
      const parsedAmount = parseFloat(amountStr.replace(/[\s,]/g, ""));
      const parsedBalance = balance
        ? parseFloat(balance.replace(/,/g, ""))
        : undefined;

      const [day, month] = date.split("/");
      const fullDate = new Date(
        currentYear,
        parseInt(month) - 1,
        parseInt(day)
      );

      transactions.push({
        date: fullDate,
        description: description.trim(),
        amount: parsedAmount,
        balance: parsedBalance,
        category: parsedAmount < 0 ? "expense" : "income",
      });
    }
  }

  return [transactions, extractedText];
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
      await fsPromises.writeFile("./test.txt", text.split("\n").join("\n"));
      console.log("Transactions written to test.json");
      console.log(`Total Transactions: ${transactions.length}`);
    } catch (err) {
      console.error("Error writing file:", err);
    }
  })
  .catch((err) => console.error("Error extracting transactions:", err));
