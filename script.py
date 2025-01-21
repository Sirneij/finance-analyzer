import asyncio
import json
import os

import fitz
from utils.resume_parser import parse_resume_text


async def extract_text_with_pymupdf(file_path: str) -> str:
    """Extracts text from PDF file using PyMuPDF (fitz)."""
    doc = fitz.open(file_path)
    text = ''
    for page in doc:
        text += page.get_text() + '\n'
    doc.close()
    return text.strip()


async def main():
    # text_1 = await extract_text_with_pymupdf('statement_1.pdf')
    # text_2 = await extract_text_with_pymupdf('statement_2.pdf')

    # with open('text_1.txt', 'w') as f:
    #     json.dump(text_1, f)

    # with open('text_2.txt', 'w') as f:
    #     json.dump(text_2, f)
    # Use the resume in ~/Downloads/resume/Software/John_Idogun_Software_Engineer.pdf
    text_3 = await extract_text_with_pymupdf(
        os.path.expanduser(
            '~/Downloads/resume/Software/John_Idogun_Software_Engineer.pdf'
        )
    )

    resume_json = await parse_resume_text(text_3)

    with open('resume.json', 'w') as f:
        json.dump(resume_json, f, indent=4)

    # with open('text_3.txt', 'w') as f:
    #     f.write(text_3)


if __name__ == '__main__':

    asyncio.run(main())
