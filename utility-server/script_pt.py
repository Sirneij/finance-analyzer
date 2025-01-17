import json
import re

import fitz  # PyMuPDF


def extract_text_with_pymupdf(file_path):
    """
    Extracts text from the PDF file using PyMuPDF (fitz).
    """
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    doc.close()
    return text.strip()


def parse_resume_text(text):
    """
    Parse raw text from a resume and convert it into a structured JSON-like dictionary.
    Separates 'Technologies' from 'Achievements' in the experience section.
    """

    # 1. Split text into lines and clean them up
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # 2. Prepare a dictionary to store the final structured data
    resume_data = {
        "name": "",
        "contact": {
            "phone": "",
            "email": "",
            "location": "",
            "linkedin": "",
            "github": "",
        },
        "summary": "",
        "skills": {},
        "experiences": [],
        "education": [],
    }

    # 3. Grab name and basic contact info from the top few lines (Naive approach)
    resume_data["name"] = lines[0] if len(lines) > 0 else ""
    resume_data["contact"]["phone"] = lines[1] if len(lines) > 1 else ""
    resume_data["contact"]["github"] = lines[2] if len(lines) > 2 else ""
    resume_data["contact"]["email"] = lines[3] if len(lines) > 3 else ""
    resume_data["contact"]["location"] = lines[4] if len(lines) > 4 else ""
    resume_data["contact"]["linkedin"] = lines[5] if len(lines) > 5 else ""

    # 4. Define known headings and map them to dictionary keys
    headings = {
        "Professional Summary": "summary",
        "Key Skills": "skills",
        "Professional Experience": "experiences",
        "Additional Experience": "experiences",
        "Education": "education",
    }

    # 5. Organize lines into sections
    section_lines = {k: [] for k in headings.values()}
    current_section = None
    # Start parsing lines after the top (which we assumed belong to contact info)
    for line in lines[6:]:
        if line in headings:
            current_section = headings[line]
            continue

        if current_section:
            section_lines[current_section].append(line)

    # 6. Parse "Professional Summary"
    if section_lines["summary"]:
        resume_data["summary"] = " ".join(section_lines["summary"])

    # 7. Parse "Key Skills"
    #    Example lines can look like:
    #      • Programming: Python, Rust, ...
    bullet_pattern = re.compile(r"•\s*(\w[\w\s]+):\s*(.*)")
    skills_dict = {}
    for skill_line in section_lines["skills"]:
        match = bullet_pattern.match(skill_line)
        if match:
            category = match.group(1).strip()
            skill_list = match.group(2).split(",")
            skill_list = [s.strip() for s in skill_list]
            skills_dict[category] = skill_list

    resume_data["skills"] = skills_dict

    # 8. Parse "Professional Experience" & "Additional Experience"
    #    Merged into 'experiences'
    experience_lines = section_lines["experiences"]
    i = 0
    while i < len(experience_lines):
        line = experience_lines[i]
        # We look for lines that start with "• " to mark a new company
        if line.startswith("• "):
            # Extract company name
            company_name = line.replace("• ", "").strip()

            # Next lines: location, role, period, company desc...
            location = experience_lines[i + 1] if i + 1 < len(experience_lines) else ""
            role = experience_lines[i + 2] if i + 2 < len(experience_lines) else ""
            period = experience_lines[i + 3] if i + 3 < len(experience_lines) else ""
            company_description = (
                experience_lines[i + 4] if i + 4 < len(experience_lines) else ""
            )

            # Collect bullet lines (achievements) until hitting a new "• " or the next heading
            achievements = []
            tech_stack = []
            j = i + 5
            while j < len(experience_lines):
                # If we see a new bullet "• " or a known heading, break out
                if (
                    experience_lines[j].startswith("• ")
                    or experience_lines[j] in headings
                ):
                    break
                # If the line starts with "◦Technologies:", separate it from achievements
                if experience_lines[j].startswith("◦Technologies:"):
                    # Extract everything after "Technologies:"
                    tech_str = experience_lines[j].split("Technologies:")[1]
                    # e.g. " Python 3, PostgreSQL, Docker"
                    # Convert to list
                    tech_stack = [t.strip() for t in tech_str.split(",") if t.strip()]
                elif experience_lines[j].startswith("◦"):
                    # Treat other "◦" lines as achievements
                    achievements.append(experience_lines[j].lstrip("◦").strip())

                j += 1

            # Build an experience entry
            exp_entry = {
                "role": role,
                "company": company_name,
                "companyDescription": company_description,
                "period": period,
                "description": "",  # optional short summary if you want
                "techStack": tech_stack,
                "achievements": achievements,
            }
            resume_data["experiences"].append(exp_entry)

            # Move i to j (where we stopped collecting lines for this experience)
            i = j
        else:
            i += 1

    # 9. Parse "Education"
    #    Example lines:
    #      • Federal University of Technology
    #        Akure, Nigeria
    #        Bachelor of Engineering in Computer Engineering ...
    #        Nov. 2015 – Oct. 2021
    #        ...
    #        ◦Minor: ...
    #        ◦Award: ...
    education_list = []
    edu_lines = section_lines["education"]
    i = 0
    while i < len(edu_lines):
        line = edu_lines[i]
        if line.startswith("• "):
            school_name = line.replace("• ", "").strip()
            location = edu_lines[i + 1] if i + 1 < len(edu_lines) else ""
            degree_line = edu_lines[i + 2] if i + 2 < len(edu_lines) else ""
            period_line = edu_lines[i + 3] if i + 3 < len(edu_lines) else ""
            school_description = edu_lines[i + 4] if i + 4 < len(edu_lines) else ""

            # Gather bullet achievements (like "◦Minor: ...")
            edu_achievements = []
            j = i + 5
            while j < len(edu_lines):
                if edu_lines[j].startswith("• "):
                    break
                if edu_lines[j].startswith("◦"):
                    edu_achievements.append(edu_lines[j].lstrip("◦").strip())
                j += 1

            edu_entry = {
                "degree": degree_line,
                "school": school_name,
                "schoolDescription": school_description,
                "location": location,
                "period": period_line,
                "achievements": edu_achievements,
            }
            education_list.append(edu_entry)

            i = j
        else:
            i += 1

    resume_data["education"] = education_list

    return resume_data


if __name__ == "__main__":
    # Suppose we've already extracted the raw text from a resume PDF
    text = extract_text_with_pymupdf("John_Idogun_Software_Engineer.pdf")
    # For demonstration, let's pretend 'text' is the string you posted:

    parsed = parse_resume_text(text)

    with open("parsed_resume.json", "w") as f:
        json.dump(parsed, f, indent=4)
