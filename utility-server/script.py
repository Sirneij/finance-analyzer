import pdfplumber
import re
import json
import pymupdf


def extract_text_from_pdf(file_path):
    """
    Extracts text from the PDF file using pdfplumber.
    """
    with pdfplumber.open(file_path) as pdf:
        text = "\n".join(page.extract_text() for page in pdf.pages)
    return text

def extract_text_with_pymupdf(file_path):
    """
    Extracts text from the PDF file using PyMuPDF (fitz).
    """
    doc = pymupdf.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()



def clean_whitespace(text):
    """
    Cleans up extra whitespace in the text.
    """
    return re.sub(r"\s+", " ", text).strip()


def extract_experiences(text):
    """
    Extracts experiences from the resume text.
    """
    experiences = []

    # Match experience entries based on the clarified structure
    experience_pattern = re.compile(
        r"(.*?) (\d{4} - .*?)\n(.*?)\n(.*?)\n(.*?)(?:\n\n|$)", re.S
    )
    matches = experience_pattern.findall(text)

    for match in matches:
        role = clean_whitespace(match[0])
        period = clean_whitespace(match[1])
        company_location = clean_whitespace(match[2])
        company_description = clean_whitespace(match[3])
        achievements = [
            clean_whitespace(desc)
            for desc in match[4].split("◦")
            if desc.strip()
        ]

        # Split company and location
        company, location = re.match(r"^(.*)\s(.*)$", company_location).groups()

        experiences.append({
            "role": role,
            "company": company.strip(),
            "companyDescription": company_description,
            "location": location.strip(),
            "period": period,
            "achievements": achievements,
        })

    return experiences


def extract_education(text):
    """
    Extracts education details from the resume text.
    """
    education = []

    # Match education entries based on the clarified structure
    education_pattern = re.compile(
        r"(.*?) (\d{4} - .*?)\n(.*?)\n(.*?)\n(.*?)(?:\n\n|$)", re.S
    )
    matches = education_pattern.findall(text)

    for match in matches:
        degree = clean_whitespace(match[0])
        period = clean_whitespace(match[1])
        school_location = clean_whitespace(match[2])
        school_description = clean_whitespace(match[3])
        achievements = [
            clean_whitespace(desc)
            for desc in match[4].split("◦")
            if desc.strip()
        ]

        # Split school and location
        school, location = re.match(r"^(.*)\s(.*)$", school_location).groups()

        education.append({
            "degree": degree,
            "school": school.strip(),
            "schoolDescription": school_description,
            "location": location.strip(),
            "period": period,
            "achievements": achievements,
        })

    return education


def extract_skills(text):
    """
    Extracts skills from the resume text and removes duplicates.
    """
    skills_pattern = re.compile(r"Key Skills\n(.*?)(?:\n\n|$)", re.S)
    match = skills_pattern.search(text)

    if not match:
        return {}

    skills_text = match.group(1)

    def remove_duplicates(items):
        return list(set(items))

    skills = {
        "Programming Languages": remove_duplicates(
            re.findall(r"Python|Java|Rust|TypeScript|C#|C\+\+|JavaScript|Go", skills_text)
        ),
        "Frontend": remove_duplicates(
            re.findall(r"Svelte|React|Vue\.js|HTML/CSS", skills_text)
        ),
        "Backend": remove_duplicates(
            re.findall(r"Node\.js|Django|Spring Boot|Flask|FastAPI", skills_text)
        ),
        "Database": remove_duplicates(
            re.findall(
                r"PostgreSQL|MySQL|MongoDB|DuckDB|Neo4j|CockroachDB", skills_text
            )
        ),
        "Cloud & DevOps": remove_duplicates(
            re.findall(r"AWS|Docker|Kubernetes|GCP|CI/CD|Digital Ocean", skills_text)
        ),
    }

    return skills


def parse_resume(file_path):
    """
    Parses the resume to extract structured data.
    """
    text = extract_text_from_pdf(file_path)

    with open("resume.txt", "w") as f:
        f.write(text)

    text_2 = extract_text_with_pymupdf(file_path)

    with open("resume_2.txt", "w") as f:
        f.write(text_2)

    return {
        "experiences": extract_experiences(text),
        "education": extract_education(text),
        "skills": extract_skills(text),
    }


def main():
    # Path to your PDF resume
    file_path = "John_Idogun_Software_Engineer.pdf"  # Replace with your PDF file path

    # Parse the resume
    parsed_data = parse_resume(file_path)

    # Save the parsed data to JSON
    output_file = "parsed_resume.json"
    with open(output_file, "w") as f:
        json.dump(parsed_data, f, indent=4)

    print(f"Parsed data saved to '{output_file}'")


if __name__ == "__main__":
    main()
