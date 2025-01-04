// import fs from "fs";
// import pdfParse from "pdf-parse";
// import { promises as fsPromises } from "fs";

// interface Transaction {
//   date: string;
//   description: string;
//   amount: number;
//   balance?: number;
//   category: "income" | "expense";
// }

// async function extractTransactionsFromPDF(
//   filePath: string
// ): Promise<[Transaction[], string]> {
//   const pdfBuffer = fs.readFileSync(filePath);
//   const data = await pdfParse(pdfBuffer);

//   const transactionPattern =
//     /(\d{2}\/\d{2})(?!.*Page)\s*([^-\d].*?)\s*(-\s*|\s+)?(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2})\s*([\d,]+\.\d{2})?/;

//   const transactions: Transaction[] = [];
//   const lines = data.text.split("\n");

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();
//     const match = transactionPattern.exec(line);

//     if (match) {
//       const [, date, description, negative, whole, decimal, balance] = match;
//       const amountStr = `${negative || ""}${whole}.${decimal}`;
//       const parsedAmount = parseFloat(amountStr.replace(/[\s,]/g, ""));
//       const parsedBalance = balance
//         ? parseFloat(balance.replace(/,/g, ""))
//         : undefined;

//       transactions.push({
//         date,
//         description: description.trim(),
//         amount: parsedAmount,
//         balance: parsedBalance,
//         category: parsedAmount < 0 ? "expense" : "income",
//       });
//     }
//   }

//   return [transactions, data.text];
// }

// // Example usage
// const filePath = "./src/test.pdf";

// extractTransactionsFromPDF(filePath)
//   .then(async (data) => {
//     const [transactions, text] = data;
//     try {
//       await fsPromises.writeFile(
//         "./test.json",
//         JSON.stringify(transactions, null, 2)
//       );
//       await fsPromises.writeFile("./test.txt", text.split("\n").join("\n"));
//       console.log("Transactions written to test.json");
//       console.log(`Total Transactions: ${transactions.length}`);
//     } catch (err) {
//       console.error("Error writing file:", err);
//     }
//   })
//   .catch((err) => console.error("Error extracting transactions:", err));

import { fromPath } from "pdf2pic";
import tesseract from "tesseract.js";
import fs from "fs/promises";

async function convertPdfToText(pdfPath: string): Promise<string> {
  try {
    const outputPath = "./temp"; // Temporary output directory
    await fs.mkdir(outputPath, { recursive: true }); // Ensure the directory exists

    // Initialize pdf2pic
    const pdf2pic = fromPath(pdfPath, {
      savePath: outputPath, // Output directory
      format: "png", // Output format
    });

    // Convert PDF to images
    console.log("Converting PDF to images...");
    const totalPages = await pdf2pic.bulk(-1); // Convert all pages
    console.log(`Converted ${totalPages.length} pages.`);

    // Process each image with Tesseract.js
    let extractedText = "";
    for (const page of totalPages) {
      console.log(`Processing page: ${page.page}`);
      const { data } = await tesseract.recognize(page.path, "eng");
      extractedText += data.text + "\n";

      // Cleanup processed image
      await fs.unlink(page.path);
    }

    // Remove temporary directory
    await fs.rm(outputPath, { recursive: true });

    return extractedText;
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw error;
  }
}

// Example usage
(async () => {
  const pdfPath = "./src/test.pdf"; // Path to your PDF file
  const text = await convertPdfToText(pdfPath);
  console.log("Extracted Text:");
  console.log(text);
})();
