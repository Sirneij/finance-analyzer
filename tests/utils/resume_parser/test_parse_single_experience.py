from src.utils.resume_parser import parse_single_experience
from tests import BaseAsyncTestClass


class TestParseSingleExperience(BaseAsyncTestClass):
    """Test the `parse_single_experience` function."""

    async def test_minimal_experience(self):
        # Minimal input with only the five primary lines.
        exp_lines = [
            '• ACME Corporation',  # company_name
            'New York, NY',  # location
            'Software Engineer',  # role
            'Jan 2020 - Present',  # period
            'Leading software development.',  # company_description
        ]
        result, next_index = await parse_single_experience(exp_lines, 0)
        expected = {
            'company': 'ACME Corporation',
            'location': 'New York, NY',
            'role': 'Software Engineer',
            'period': 'Jan 2020 - Present',
            'companyDescription': 'Leading software development.',
            'techStack': [],
            'achievements': [],
        }
        self.assertEqual(result, expected)
        self.assertEqual(next_index, 5)

    async def test_with_achievements(self):
        # Entry with multiline achievements.
        exp_lines = [
            '• Beta Corp',  # company_name
            'San Francisco, CA',  # location
            'Data Analyst',  # role
            'Feb 2019 - Dec 2019',  # period
            'Analytics specialist',  # company_description
            '◦ Improved reporting',  # achievement line start
            'by automating dashboard updates',  # achievement continuation
            '◦ Reduced costs by 20%',  # second achievement
        ]
        result, next_index = await parse_single_experience(exp_lines, 0)
        expected_achievement1 = 'Improved reporting by automating dashboard updates'
        expected_achievement2 = 'Reduced costs by 20%'
        expected = {
            'company': 'Beta Corp',
            'location': 'San Francisco, CA',
            'role': 'Data Analyst',
            'period': 'Feb 2019 - Dec 2019',
            'companyDescription': 'Analytics specialist',
            'techStack': [],
            'achievements': [expected_achievement1, expected_achievement2],
        }
        self.assertEqual(result, expected)
        self.assertEqual(next_index, 8)

    async def test_with_technologies(self):
        # Entry with a tech stack.
        exp_lines = [
            '• Gamma Inc.',  # company_name
            'Austin, TX',  # location
            'Backend Developer',  # role
            'Mar 2018 - Jul 2018',  # period
            'Developed server infrastructure',  # company_description
            '◦Technologies: Python, Java, C#',  # tech stack line
        ]
        result, next_index = await parse_single_experience(exp_lines, 0)
        expected = {
            'company': 'Gamma Inc.',
            'location': 'Austin, TX',
            'role': 'Backend Developer',
            'period': 'Mar 2018 - Jul 2018',
            'companyDescription': 'Developed server infrastructure',
            'techStack': ['Python', 'Java', 'C#'],
            'achievements': [],
        }
        self.assertEqual(result, expected)
        self.assertEqual(next_index, 6)

    async def test_with_mixed_entries(self):
        # Entry mixing both achievements and tech stack.
        exp_lines = [
            '• Delta Ltd.',  # company_name
            'Seattle, WA',  # location
            'Full Stack Developer',  # role
            'Apr 2017 - Nov 2017',  # period
            'Worked on end-to-end solutions',  # company_description
            '◦ Launched new e-commerce platform',  # achievement start
            'with increased traffic',  # achievement continuation
            '◦Technologies: React, Node.js',  # tech stack start
            'Express',  # tech stack continuation
        ]
        result, next_index = await parse_single_experience(exp_lines, 0)
        expected_achievement = 'Launched new e-commerce platform with increased traffic'
        # Concatenated tech string becomes 'React, Node.js Express'.
        # Assuming split_on_commas_outside_parentheses produces:
        expected = {
            'company': 'Delta Ltd.',
            'location': 'Seattle, WA',
            'role': 'Full Stack Developer',
            'period': 'Apr 2017 - Nov 2017',
            'companyDescription': 'Worked on end-to-end solutions',
            'techStack': ['React', 'Node.js Express'],
            'achievements': [expected_achievement],
        }
        self.assertEqual(result, expected)
        self.assertEqual(next_index, len(exp_lines))

    async def test_new_experience_break(self):
        # Test that if a new experience entry is encountered immediately after the primary five lines,
        # the loop breaks without processing any extra lines.
        exp_lines = [
            '• First Corp',  # company_name (experience 1)
            'Los Angeles, CA',  # location
            'Developer',  # role
            '2018 - 2019',  # period
            'First company description',  # company_description
            '• Second Corp',  # new experience starts here, should trigger break
            'Some extra detail',
        ]
        result, next_index = await parse_single_experience(exp_lines, 0)
        expected = {
            'company': 'First Corp',
            'location': 'Los Angeles, CA',
            'role': 'Developer',
            'period': '2018 - 2019',
            'companyDescription': 'First company description',
            'techStack': [],
            'achievements': [],
        }
        self.assertEqual(result, expected)
        self.assertEqual(next_index, 5)

    async def test_else_branch(self):
        # Test that a line that doesn't match '• ', '◦Technologies:' or '◦' is simply skipped.
        exp_lines = [
            '• Solo Corp',  # company_name
            'Chicago, IL',  # location
            'Engineer',  # role
            '2020 - 2021',  # period
            'Solo company description',  # company_description
            'This is a random line',  # should trigger the else branch
        ]
        result, next_index = await parse_single_experience(exp_lines, 0)
        expected = {
            'company': 'Solo Corp',
            'location': 'Chicago, IL',
            'role': 'Engineer',
            'period': '2020 - 2021',
            'companyDescription': 'Solo company description',
            'techStack': [],
            'achievements': [],
        }
        self.assertEqual(result, expected)
        self.assertEqual(next_index, 6)
