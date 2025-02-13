import os

import aiohttp

from tests import BaseAioHTTPTestCase


class TestResumeExtractor(BaseAioHTTPTestCase):
    async def asyncSetUp(self):
        await super().asyncSetUp()
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.fixtures_dir = os.path.join(current_dir, 'fixtures')
        os.makedirs(self.fixtures_dir, exist_ok=True)
        self.sample_pdf = os.path.join(self.fixtures_dir, 'sample.pdf')

    async def test_extract_text_success(self):
        """Test extracting text from a PDF file"""
        with open(self.sample_pdf, 'rb') as f:
            data = aiohttp.FormData()
            data.add_field('file', f, filename='sample.pdf', content_type='application/pdf')

            resp = await self.client.post('/parse-resume', data=data)

        self.assertEqual(resp.status, 200)
        json_response = await resp.json()
        self.assertEqual(json_response['name'], 'John Owolabi Idogun')
        self.assertEqual(json_response['contact']['email'], 'john.owolabi.idogun@gmail.com')
        self.assertEqual(json_response['contact']['linkedin'], 'linkedin.com/in/john-owolabi-idogun')

        expected_experience = [
            {
                'role': 'Software Engineer',
                'company': 'Arve Limited (QuickCheck)',
                'location': 'Lagos, Nigeria',
                'companyDescription': 'Arve Limited is a leading provider of financial services for individuals and small businesses in Nigeria through its online lending platform.',
                'period': 'Oct. 2021 - Oct. 2023',
                'techStack': [
                    'Python 3 (Django & Django REST Framework, MyPy)',
                    'PostgreSQL',
                    'Pytest',
                    'Celery',
                    'JavaScript (jQuery & Ajax, ReactNative)',
                    'C# (.NET)',
                    'Docker',
                    'Linux (Ubuntu)',
                    'Git (GitLab)',
                    'Trello.',
                ],
                'achievements': [
                    'Payment Integrations: Streamlined payment operations by seamlessly integrating payment gateways like Monnify and Paystack to handle over 500K daily transactions.',
                    'Loan Investigation: Created an automated loan investigation system, reducing manual processing time by 50% and improving issue accuracy.',
                    'Loan Recovery: Integrated multiple agencies for loan recovery, automating updates to Google Sheets, reducing labour by 40%, and ensuring accurate commission payments.',
                    'User Credit Levels: Automated customer credit level upgrades, reducing errors by 70% and improving user experience.',
                    'Dynamic Django Global Settings: Implemented a dynamic settings modification system, reducing server downtime by 20% without restarts.',
                ],
            },
            {
                'role': 'Research & Systems Architecture Intern',
                'company': 'ipNX Nigeria Limited',
                'location': 'Lagos, Nigeria',
                'companyDescription': 'ipNX is an ICT company providing corporate and residential customers with network connectivity, internet, telephony, TV, and cloud-based services.',
                'period': 'Aug. 2019 - Jan. 2020',
                'techStack': ['Python (Django and Flask)', 'JavaScript', 'C# (.NET)', 'Linux (Ubuntu)', 'Git(GitHub)'],
                'achievements': [
                    'Internet Subscription Management: Engineered an internet subscription management system featuring real-time data visualization using Chart.js and JavaScript along with Python, elevating subscription tracking and data accuracy by 25%.',
                    'Documentation Portal: Created a documentation system with threaded commenting, full-text search, and CRUD functionalities, enhancing documentation accessibility and collaboration by 30%.',
                ],
            },
            {
                'role': 'Graduate Teaching & Research Assistant',
                'company': 'Stony Brook University',
                'location': 'Stony Brook, New York, United States',
                'companyDescription': 'New York State flagship University.',
                'period': 'Aug. 2023 - Present',
                'techStack': [],
                'achievements': [
                    'Database Design and Practice (ISE305): Enhanced students’ comprehension of database design principles and resolved SQL-based inquiries to elevate performance.',
                    'Research: Achieved enhanced data accuracy by streamlining the performance analysis in logic and database systems to eradicate manual processes using Python for automated analysis.',
                    '2D Game Programming (CSE 380) & Software Engineering (CSE 416): Played a pivotal role in spearheading student projects dedicated to automating healthcare processes, resulting in a remarkable 50% decrease in processing time by leveraging MERN stack technologies.',
                    'Computer Systems Fundamentals I (CSE 220): Designed and administered test cases, supervised exams, and assessed assignments using Excel and Learning Management System (LMS) software to enhance operational efficiency by 20%.',
                ],
            },
            {
                'role': 'Volunteer Technical Writer and Trusted Member',
                'company': 'DEV Community',
                'location': 'Online',
                'companyDescription': 'DEV is a community of software developers getting together to help one another out.',
                'period': 'June 2021 - Present',
                'techStack': [],
                'achievements': [
                    'Technical Writer: Drove a significant increase in engagement and readership through over 60 top-tier technical content focusing on Software Engineering challenges, utilizing Python, Rust, Go, C# (.NET), and JavaScript/TypeScript.',
                    'GitHub + DEV 2023 Hackathon Runner-Up: Secured the runner-up position in GitHub + DEV 2023 Hackathon by authoring articles on enriching GitHub actions with an efficient, secure, and dependable session-based authentication system orchestrated with Django and SvelteKit, commended by participants for its innovation.',
                    'Trusted Member: Fostered positive interactions and maintained community guidelines on DEV Community by managing inappropriate content discussions as a Trusted Member, using adherence tools from the Trusted Member panel, and overseeing 500+ interactions.',
                ],
            },
        ]

        self.assertEqual(json_response['experiences'], expected_experience)

    async def test_field_name_not_file(self):
        """Test handling a request with a file uploaded under a different field name"""
        with open(self.sample_pdf, 'rb') as f:
            data = aiohttp.FormData()
            data.add_field('not_file', f, filename='sample.pdf', content_type='application/pdf')

            resp = await self.client.post('/parse-resume', data=data)

        self.assertEqual(resp.status, 400)
        json_response = await resp.json()
        self.assertIn('error', json_response)
        self.assertEqual(json_response['error'], 'No file field in request')

    async def test_invalid_file(self):
        """Test handling a request with an invalid file"""
        data = aiohttp.FormData()
        data.add_field(
            'file',
            b'not a pdf file',
            filename='test.pdf',
            content_type='application/pdf',
        )

        resp = await self.client.post('/parse-resume', data=data)
        self.assertEqual(resp.status, 500)
        json_response = await resp.json()
        self.assertIn('error', json_response)
