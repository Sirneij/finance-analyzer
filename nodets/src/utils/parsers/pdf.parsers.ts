import { baseConfig } from "$config/base.config.js";
import { ITransaction } from "$types/transaction.types.js";
import { BaseParser } from "$utils/file.utils.js";

export class PDFParser extends BaseParser {
  private static readonly TRANSACTION_PATTERN =
    /(\d{2}\/\d{2})(?!.*Page)\s*([^-\d].*?)\s*(-\s*|\s+)?(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2})\s*([\d,]+\.\d{2})?/;

  async parse(buffer: Buffer): Promise<Partial<ITransaction>[]> {
    const formData = new FormData();
    formData.append("file", new Blob([buffer]), "document.pdf");

    const response = await fetch(
      `${baseConfig.utility_service_url}/extract-text`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    const extractedText = data.text;
    const lines = extractedText.split("\n");

    const dateHeaderPattern = /([A-Za-z]+ \d{2}, (\d{4})) through/;
    let currentYear = new Date().getFullYear();

    const transactions: Partial<ITransaction>[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      const headerMatch = dateHeaderPattern.exec(line);
      if (headerMatch) {
        currentYear = parseInt(headerMatch[2]);
      }

      const match = PDFParser.TRANSACTION_PATTERN.exec(line);

      if (match) {
        const [, date, description, negative, whole, decimal, balance] = match;
        const amountStr = `${negative || ""}${whole}.${decimal}`;
        const parsedAmount = parseFloat(amountStr.replace(/[\s,]/g, ""));
        const parsedBalance = balance
          ? parseFloat(balance.replace(/,/g, ""))
          : 0.0;

        const fullDate = `${date}/${currentYear}`;

        transactions.push(
          this.mapToTransaction({
            userId: this.userId,
            date: fullDate,
            description: description.trim(),
            amount: parsedAmount,
            balance: parsedBalance,
            type: parsedAmount < 0 ? "expense" : "income",
          })
        );
      }
    }

    return transactions;
  }
}
