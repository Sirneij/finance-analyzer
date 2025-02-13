from src.utils.resume_parser import parse_resume_text
from tests import BaseAsyncTestClass


class TestParseResumeText(BaseAsyncTestClass):
    async def test_parse_resume_text_minimal(self):
        # Build a sample resume text with contact info and all sections.
        # The first 8 non-empty lines are interpreted as contact info.
        resume_text = '\n'.join(
            [
                'John Doe',  # name
                '1234567890',  # phone
                'Software Engineer',  # title
                'john@example.com',  # email
                'github.com/johndoe',  # github
                'linkedin.com/in/johndoe',  # linkedin
                'New York, USA',  # location
                'johndoe.com',  # website
                'Professional Summary',  # section heading -> summary
                'Experienced software engineer.',  # summary line 1
                'Focused on backend development.',  # summary line 2
                'Key Skills',  # section heading -> skills
                '• Languages: Python, Java',  # skills line
                'Professional Experience',  # section heading -> experiences
                '• Company A',  # experience: company (marker removed)
                'New York',  # experience: location
                'Software Engineer',  # experience: role
                '2020 - Present',  # experience: period
                'Leading projects',  # experience: company description
                '◦ Led initiative',  # experience: achievement start
                'that improved process',  # achievement continuation
                'Education',  # section heading -> education
                '• University X',  # education: school (marker removed)
                'Boston',  # education: location
                'B.Sc in Computer Science',  # education: degree
                '2015 - 2019',  # education: period
                'Top ranked university',  # education: school description
            ]
        )

        # Expected dictionary from parse_resume_text
        expected = {
            'name': 'John Doe',
            'title': 'Software Engineer',
            'contact': {
                'phone': '1234567890',
                'email': 'john@example.com',
                'github': 'github.com/johndoe',
                'linkedin': 'linkedin.com/in/johndoe',
                'location': 'New York, USA',
                'website': 'johndoe.com',
            },
            'summary': 'Experienced software engineer. Focused on backend development.',
            'skills': {
                'Languages': ['Python', 'Java'],
            },
            'experiences': [
                {
                    'company': 'Company A',
                    'location': 'New York',
                    'role': 'Software Engineer',
                    'period': '2020 - Present',
                    'companyDescription': 'Leading projects',
                    'techStack': [],
                    'achievements': ['Led initiative that improved process'],
                }
            ],
            'educations': [
                {
                    'school': 'University X',
                    'location': 'Boston',
                    'degree': 'B.Sc in Computer Science',
                    'period': '2015 - 2019',
                    'schoolDescription': 'Top ranked university',
                    'achievements': [],
                }
            ],
        }

        result = await parse_resume_text(resume_text)
        self.assertEqual(result, expected)

    async def test_parse_resume_text_without_section_headings(self):
        # This test ensures that if no valid section headings appear after the first 8 lines,
        # then 'current_section' remains False and no stray lines are assigned to any section.
        resume_text = '\n'.join(
            [
                'Alice Smith',  # name
                '9876543210',  # phone
                'Data Scientist',  # title
                'alice@example.com',  # email
                'github.com/alicesmith',  # github
                'linkedin.com/in/alicesmith',  # linkedin
                'San Francisco, USA',  # location
                'alicesmith.com',  # website
                'This is just some random text that does not match any heading',
                'Another irrelevant line',
            ]
        )

        expected = {
            'name': 'Alice Smith',
            'title': 'Data Scientist',
            'contact': {
                'phone': '9876543210',
                'email': 'alice@example.com',
                'github': 'github.com/alicesmith',
                'linkedin': 'linkedin.com/in/alicesmith',
                'location': 'San Francisco, USA',
                'website': 'alicesmith.com',
            },
            'summary': '',
            'skills': {},
            'experiences': [],
            'educations': [],
        }

        result = await parse_resume_text(resume_text)
        self.assertEqual(result, expected)
