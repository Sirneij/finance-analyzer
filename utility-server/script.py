import asyncio
import json

import fitz


async def extract_text_with_pymupdf(file_path: str) -> str:
    """Extracts text from PDF file using PyMuPDF (fitz)."""
    doc = fitz.open(file_path)
    text = ''
    for page in doc:
        text += page.get_text() + '\n'
    doc.close()
    return text.strip()


async def main():
    text_1 = await extract_text_with_pymupdf('statement_1.pdf')
    text_2 = await extract_text_with_pymupdf('statement_2.pdf')

    with open('text_1.txt', 'w') as f:
        json.dump(text_1, f)

    with open('text_2.txt', 'w') as f:
        json.dump(text_2, f)



if __name__ == '__main__':

    asyncio.run(main())