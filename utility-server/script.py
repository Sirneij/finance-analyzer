import re
from collections import defaultdict
from typing import Dict, List, Optional

import pdfplumber


def preprocess_text(text: str) -> str:
    """Clean and normalize text"""
    text = re.sub(r'\s+', ' ', text)
    text = text.replace('\n', ' ')
    text = re.sub(r'[^\w\s@.()-+]', '', text)
    return text.strip()


def extract_text_from_pdf(file_path: str) -> str:
    try:
        with pdfplumber.open(file_path) as pdf:
            return "\n".join(
                page.extract_text() for page in pdf.pages if page.extract_text()
            )
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""


def split_into_sentences(text: str) -> List[str]:
    """Split text into sentences using regex"""
    return [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]


def extract_sections(text: str) -> Dict[str, str]:
    sections = {
        "Professional Summary": r"(?:Professional\s+Summary|Summary|Profile)(.*?)(?=Key\s+Skills|Skills|Experience|Education|$)",
        "Key Skills": r"(?:Key\s+Skills|Technical\s+Skills|Skills)(.*?)(?=Experience|Education|$)",
        "Professional Experience": r"(?:Professional\s+Experience|Work\s+Experience|Experience)(.*?)(?=Education|$)",
        "Education": r"Education(.*?)(?=$)",
    }

    extracted = {}
    for section, pattern in sections.items():
        match = re.search(pattern, text, re.I | re.S)
        if match:
            section_text = match.group(1).strip()
            sentences = split_into_sentences(section_text)
            extracted[section] = " ".join(sentences)

    return extracted


def extract_contact_details(text: str) -> Dict[str, Optional[str]]:
    patterns = {
        "Phone": r'(?:(?:\+|00)[1-9]\d{0,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}',
        "Email": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
        "LinkedIn": r'(?:linkedin\.com/in/|linkedin/in/|linkedin\.com/)[\w-]+',
    }

    return {
        key: next((match.group().strip() for match in re.finditer(pattern, text)), None)
        for key, pattern in patterns.items()
    }


def extract_entities(text: str) -> Dict[str, List[str]]:
    patterns = {
        "DATE": r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*(?:-|to|–)\s*(?:Present|Current|\d{4})',
        "ORG": r'\b[A-Z][a-z]*(?:\s+[A-Z][a-z]*)*(?:\s+(?:Inc|Ltd|LLC|Corporation|Corp|Limited))?\b',
        "SKILL": r'\b(?:Python|Java|JavaScript|C\+\+|SQL|AWS|Docker|Kubernetes|Git)\b',
        "LOCATION": r'\b[A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+)*(?:[\s,]+[A-Z]{2})?\b',
    }

    entities = defaultdict(list)
    for entity_type, pattern in patterns.items():
        entities[entity_type].extend(
            set(m.group().strip() for m in re.finditer(pattern, text))
        )
    return dict(entities)


def parse_resume(file_path: str) -> Dict:
    text = extract_text_from_pdf(file_path)
    if not text:
        return {}

    text = preprocess_text(text)
    sections = extract_sections(text)

    return {
        "Contact Details": extract_contact_details(text),
        "Sections": sections,
        "Experience Entities": extract_entities(
            sections.get("Professional Experience", "")
        ),
        "Education Entities": extract_entities(sections.get("Education", "")),
    }


def save_to_json(data, output_file):
    """
    Saves the parsed data to a JSON file.
    """
    import json

    with open(output_file, "w") as json_file:
        json.dump(data, json_file, indent=4)
    print(f"Data successfully saved to {output_file}")


def main():
    # Path to your PDF resume
    file_path = "John_Idogun_Software_Engineer.pdf"
    output_file = "parsed_resume.json"

    # Parse the resume
    parsed_data = parse_resume(file_path)

    # Save the parsed data to a JSON file
    save_to_json(parsed_data, output_file)

    # Output the results
    print("Parsed data:")
    for key, value in parsed_data.items():
        print(f"\n=== {key} ===")
        print(value)


if __name__ == "__main__":
    main()
