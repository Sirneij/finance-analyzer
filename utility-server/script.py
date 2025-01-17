import asyncio
import json
import re

import fitz  # PyMuPDF


async def extract_text_with_pymupdf(file_path):
    """Extracts text from PDF file using PyMuPDF (fitz)."""
    doc = fitz.open(file_path)
    text = ''
    for page in doc:
        text += page.get_text() + '\n'
    doc.close()
    return text.strip()


async def parse_contact_info(lines):
    """Parse basic contact information from first few lines."""
    contact = {
        'name': lines[0] if len(lines) > 0 else '',
        'contact': {
            'phone': lines[1] if len(lines) > 1 else '',
            'github': lines[2] if len(lines) > 2 else '',
            'email': lines[3] if len(lines) > 3 else '',
            'location': lines[4] if len(lines) > 4 else '',
            'linkedin': lines[5] if len(lines) > 5 else '',
        },
    }
    return contact


async def parse_summary(section_lines):
    """Parse professional summary section."""
    return ' '.join(section_lines)


async def parse_skills(section_lines):
    """Parse skills section into categorized dictionary."""
    bullet_pattern = re.compile(r'•\s*(\w[\w\s]+):\s*(.*)')

    skill_categories = {
        'Programming Languages': [
            'python',
            'javascript',
            'typescript',
            'rust',
            'go',
            'java',
            'c++',
            'c#',
            'scala',
            'ruby',
            'php',
            'swift',
            'kotlin',
            'dart',
            'r',
            'shell',
            'bash',
            'powershell',
            'perl',
            'lua',
            'groovy',
            'haskell',
            'elixir',
            'clojure',
            'f#',
            'ocaml',
            'nim',
            'julia',
            'erlang',
            'scheme',
            'fortran',
            'cobol',
            'ada',
            'apl',
            'prolog',
            'lisp',
            'smalltalk',
            'forth',
            'verilog',
            'vhdl',
            'pascal',
            'delphi',
            'visual basic',
            'actionscript',
            'assembly',
            'objective-c',
            'matlab',
            'labview',
            'scratch',
            'alice',
            'logo',
            'turing',
            'racket',
            'sml',
            'sql',
            'pl/sql',
            't-sql',
            'mysql',
            'postgresql',
            'sqlite',
            'oracle',
            'mssql',
            'db2',
            'mariadb',
            'cassandra',
            'mongodb',
            'redis',
            'couchbase',
            'couchdb',
            'firebase',
            'dynamodb',
            'cosmosdb',
            'bigquery',
            'snowflake',
            'redshift',
            'athena',
            'aurora',
            'spanner',
            'rds',
            'dax',
            'influxdb',
            'neo4j',
            'couchbase',
            'couchdb',
            'firebase',
            'bigquery',
            'snowflake',
            'redshift',
            'athena',
            'dynamodb',
            'cosmosdb',
            'azure sql',
            'spanner',
            'aurora',
            'rds',
            'dax',
            'influxdb',
            'neo4j',
            'couchbase',
            'couchdb',
            'firebase',
            'bigquery',
            'snowflake',
            'redshift',
            'athena',
            'dynamodb',
            'cosmosdb',
            'azure sql',
            'spanner',
            'aurora',
            'rds',
            'dax',
        ],
        'Backend': [
            'django',
            'fastapi',
            'flask',
            'node',
            'express',
            'nest',
            'spring',
            'graphql',
            'rest',
            'grpc',
        ],
        'Frontend': [
            'react',
            'vue',
            'angular',
            'html',
            'css',
            'sass',
            'webpack',
            'babel',
            'next.js',
            'tailwind',
            'bootstrap',
            'jquery',
            'd3',
            'chart.js',
            'three.js',
            'webgl',
            'canvas',
            'svg',
            'p5.js',
            'leaflet',
            'mapbox',
            'google maps',
            'openlayers',
        ],
        'Databases': [
            'postgresql',
            'mysql',
            'mongodb',
            'redis',
            'elasticsearch',
            'cassandra',
            'dynamodb',
            'sqlite',
            'sql server',
            'oracle',
            'db2',
            'mariadb',
            'cockroachdb',
            'influxdb',
            'neo4j',
            'couchbase',
            'couchdb',
            'firebase',
            'bigquery',
            'snowflake',
            'redshift',
            'athena',
            'dynamodb',
            'cosmosdb',
            'azure sql',
            'spanner',
            'aurora',
            'rds',
            'dax',
        ],
        'Cloud & DevOps': [
            'aws',
            'gcp',
            'azure',
            'docker',
            'kubernetes',
            'terraform',
            'jenkins',
            'github actions',
            'gitlab ci',
            'nginx',
            'linux',
            'ci/cd',
            'prometheus',
            'grafana',
            'elk',
            'datadog',
            'new relic',
        ],
    }

    categorized_skills = {category: [] for category in skill_categories}
    categorized_skills['Other'] = []

    for skill_line in section_lines:
        match = bullet_pattern.match(skill_line)
        if match:
            skills = [s.strip() for s in match.group(2).split(',')]

            for skill in skills:
                skill_lower = skill.lower()
                categorized = False

                for category, keywords in skill_categories.items():
                    if any(keyword in skill_lower for keyword in keywords):
                        categorized_skills[category].append(skill)
                        categorized = True
                        break

                if not categorized:
                    categorized_skills['Other'].append(skill)

    # Clean up: remove duplicates, sort, and remove empty categories
    return {k: sorted(list(set(v))) for k, v in categorized_skills.items() if v}


async def parse_single_experience(exp_lines, start_idx):
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
            tech_str = exp_lines[j].split('Technologies:')[1]
            tech_stack = [t.strip() for t in tech_str.split(',') if t.strip()]
        elif exp_lines[j].startswith('◦'):
            achievements.append(exp_lines[j].lstrip('◦').strip())
        j += 1

    return {
        'role': role,
        'company': company_name,
        'companyDescription': company_description,
        'period': period,
        'techStack': tech_stack,
        'achievements': achievements,
    }, j


async def parse_experiences(section_lines):
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


async def parse_single_education(edu_lines, start_idx):
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


async def parse_education(section_lines):
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


async def parse_resume_text(text):
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
    for line in lines[6:]:
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
        'education': education,
    }

    return resume_data


async def main():
    text = await extract_text_with_pymupdf('John_Idogun_Software_Engineer.pdf')
    parsed = await parse_resume_text(text)

    with open('resume.json', 'w') as f:
        json.dump(parsed, f, indent=4)


if __name__ == '__main__':
    asyncio.run(main())
