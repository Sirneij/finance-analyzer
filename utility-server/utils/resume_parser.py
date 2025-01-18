import re
from typing import Union

import fitz  # PyMuPDF


async def extract_text_with_pymupdf(file_content: Union[str, bytes]) -> str:
    """Extracts text from PDF using PyMuPDF (fitz).

    Args:
        file_content: Either file path (str) or PDF bytes
    Returns:
        Extracted text from PDF
    """
    if isinstance(file_content, str):
        # Handle file path
        doc = fitz.open(file_content)
    else:
        # Handle bytes
        doc = fitz.open(stream=file_content, filetype="pdf")

    text = ''
    for page in doc:
        text += page.get_text() + '\n'
    doc.close()
    return text.strip()


async def parse_contact_info(lines: list) -> dict[str, dict[str, str]]:
    """Parse basic contact information from first few lines."""
    contact = {
        'name': lines[0] if len(lines) > 0 else '',
        'title': lines[2] if len(lines) > 2 else '',
        'contact': {
            'phone': lines[1] if len(lines) > 1 else '',
            'email': lines[3] if len(lines) > 3 else '',
            'github': lines[4] if len(lines) > 4 else '',
            'linkedin': lines[5] if len(lines) > 5 else '',
            'location': lines[6] if len(lines) > 6 else '',
            'website': lines[7] if len(lines) > 7 else '',
        },
    }
    return contact


def split_on_commas_outside_parentheses(s: str) -> list[str]:
    """
    Split a string on commas that are NOT inside parentheses.
    E.g.
      "Python 3 (Django), PostgreSQL, JavaScript (jQuery, ReactNative)"
    becomes
      ["Python 3 (Django)", "PostgreSQL", "JavaScript (jQuery, ReactNative)"]
    """
    return re.split(r',(?![^()]*\))', s)


async def parse_summary(section_lines: list[str]) -> str:
    """Parse professional summary section."""
    return ' '.join(section_lines)


async def parse_skills(section_lines: list[str]) -> dict[str, list[str]]:
    """Parse skills section into categorized dictionary."""
    bullet_pattern = re.compile(r'•\s*(.+?):\s*(.*)')

    skills_dict = {}
    for line in section_lines:
        match = bullet_pattern.match(line)
        if match:
            category = match.group(1).strip()
            skills_raw = match.group(2).strip()
            skill_list = [
                skill.strip()
                for skill in split_on_commas_outside_parentheses(skills_raw)
            ]
            # For each skill, remove trailing periods
            skill_list = [skill.rstrip('.') for skill in skill_list]

            skills_dict[category] = skill_list
    return skills_dict


async def parse_single_experience(
    exp_lines: list[str], start_idx: int
) -> tuple[dict[str, str], int]:
    """Parse a single experience entry."""
    company_name = exp_lines[start_idx].replace('• ', '').strip()
    location = exp_lines[start_idx + 1] if start_idx + 1 < len(exp_lines) else ''
    role = exp_lines[start_idx + 2] if start_idx + 2 < len(exp_lines) else ''
    period = exp_lines[start_idx + 3] if start_idx + 3 < len(exp_lines) else ''
    company_description = (
        exp_lines[start_idx + 4] if start_idx + 4 < len(exp_lines) else ''
    )

    achievements = []
    tech_stack = []
    j = start_idx + 5
    while j < len(exp_lines):
        if exp_lines[j].startswith('• '):
            break
        if exp_lines[j].startswith('◦Technologies:'):
            tech_str = exp_lines[j].split('Technologies:', 1)[1].strip()
            # Split only on commas outside parentheses
            items = split_on_commas_outside_parentheses(tech_str)
            tech_stack = [t.strip() for t in items if t.strip()]

        elif exp_lines[j].startswith('◦'):
            achievements.append(exp_lines[j].lstrip('◦').strip())
        j += 1

    return {
        'role': role,
        'company': company_name,
        'location': location,
        'companyDescription': company_description,
        'period': period,
        'techStack': tech_stack,
        'achievements': achievements,
    }, j


async def parse_experiences(section_lines: list[str]) -> list[dict[str, str]]:
    """Parse all professional experiences."""
    experiences = []
    i = 0
    while i < len(section_lines):
        if section_lines[i].startswith('• '):
            exp_entry, next_idx = await parse_single_experience(section_lines, i)
            experiences.append(exp_entry)
            i = next_idx
        else:
            i += 1
    return experiences


async def parse_single_education(
    edu_lines: list[str], start_idx: int
) -> tuple[dict[str, str], int]:
    """Parse a single education entry."""
    school_name = edu_lines[start_idx].replace('• ', '').strip()
    location = edu_lines[start_idx + 1] if start_idx + 1 < len(edu_lines) else ''
    degree_line = edu_lines[start_idx + 2] if start_idx + 2 < len(edu_lines) else ''
    period_line = edu_lines[start_idx + 3] if start_idx + 3 < len(edu_lines) else ''
    school_description = (
        edu_lines[start_idx + 4] if start_idx + 4 < len(edu_lines) else ''
    )

    achievements = []
    j = start_idx + 5
    while j < len(edu_lines):
        if edu_lines[j].startswith('• '):
            break
        if edu_lines[j].startswith('◦'):
            achievements.append(edu_lines[j].lstrip('◦').strip())
        j += 1

    return {
        'degree': degree_line,
        'school': school_name,
        'schoolDescription': school_description,
        'location': location,
        'period': period_line,
        'achievements': achievements,
    }, j


async def parse_education(section_lines: list[str]) -> list[dict[str, str]]:
    """Parse all education entries."""
    education_list = []
    i = 0
    while i < len(section_lines):
        if section_lines[i].startswith('• '):
            edu_entry, next_idx = await parse_single_education(section_lines, i)
            education_list.append(edu_entry)
            i = next_idx
        else:
            i += 1
    return education_list


async def parse_resume_text(text: str) -> dict[str, dict[str, str]]:
    """Parse raw text from resume into structured JSON-like dictionary."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # Define section headings
    headings = {
        'Professional Summary': 'summary',
        'Key Skills': 'skills',
        'Professional Experience': 'experiences',
        'Additional Experience': 'experiences',
        'Education': 'education',
    }

    # Organize lines into sections
    section_lines = {k: [] for k in headings.values()}
    current_section = None
    for line in lines[8:]:
        if line in headings:
            current_section = headings[line]
            continue
        if current_section:
            section_lines[current_section].append(line)

    # Parse each section concurrently
    contact_info = await parse_contact_info(lines)
    summary = await parse_summary(section_lines['summary'])
    skills = await parse_skills(section_lines['skills'])
    experiences = await parse_experiences(section_lines['experiences'])
    education = await parse_education(section_lines['education'])

    # Combine results
    resume_data = {
        **contact_info,
        'summary': summary,
        'skills': skills,
        'experiences': experiences,
        'educations': education,
    }

    return resume_data
