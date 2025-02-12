from src.utils.resume_parser import parse_experiences
from tests import BaseAsyncTestClass


class TestParseExperiences(BaseAsyncTestClass):
    """Exhaustive tests for the parse_experiences function."""

    async def test_empty_input(self):
        # When no lines are provided, return an empty list.
        section_lines = []
        result = await parse_experiences(section_lines)
        self.assertEqual(result, [])

    async def test_no_experience_marker(self):
        # When none of the lines starts with the bullet marker "• ", no experience is parsed.
        section_lines = [
            "This is just some random text.",
            "Another line without proper marker.",
        ]
        result = await parse_experiences(section_lines)
        self.assertEqual(result, [])

    async def test_single_experience_minimal(self):
        # A minimal valid experience entry consists of exactly 5 lines:
        # 0: company name (with bullet), 1: location, 2: role, 3: period, 4: company description.
        section_lines = [
            "• Company A",  # company
            "Location A",  # location
            "Role A",  # role
            "Period A",  # period
            "Description A",  # company description
        ]
        result = await parse_experiences(section_lines)
        expected = [
            {
                'company': "Company A",
                'location': "Location A",
                'role': "Role A",
                'period': "Period A",
                'companyDescription': "Description A",
                'techStack': [],
                'achievements': [],
            }
        ]
        self.assertEqual(result, expected)

    async def test_single_experience_with_achievement(self):
        # Single experience entry with an achievement line.
        section_lines = [
            "• Company B",  # line 0: company name
            "Location B",  # line 1: location
            "Role B",  # line 2: role
            "Period B",  # line 3: period
            "Description B",  # line 4: company description
            "◦ Achieved something",  # achievement start at line 5
            "that improved output",  # achievement continuation
        ]
        result = await parse_experiences(section_lines)
        expected_achievement = "Achieved something that improved output"
        expected = [
            {
                'company': "Company B",
                'location': "Location B",
                'role': "Role B",
                'period': "Period B",
                'companyDescription': "Description B",
                'techStack': [],
                'achievements': [expected_achievement],
            }
        ]
        self.assertEqual(result, expected)

    async def test_single_experience_with_technologies(self):
        # Single experience entry with a technologies line.
        section_lines = [
            "• Company C",  # company name
            "Location C",  # location
            "Role C",  # role
            "Period C",  # period
            "Description C",  # company description
            "◦Technologies: Python, Java",  # technology line
            "Script",  # continuation of technology line (merged with previous)
        ]
        result = await parse_experiences(section_lines)
        # The concatenated tech string becomes "Python, Java Script"
        # Assuming split_on_commas_outside_parentheses splits on commas outside parens,
        # we expect a tech stack as follows.
        expected = [
            {
                'company': "Company C",
                'location': "Location C",
                'role': "Role C",
                'period': "Period C",
                'companyDescription': "Description C",
                'techStack': ["Python", "Java Script"],
                'achievements': [],
            }
        ]
        self.assertEqual(result, expected)

    async def test_multiple_experiences(self):
        # Two experience entries in the section_lines.
        section_lines = [
            # First experience entry (5 minimal lines + achievement)
            "• Company X",
            "Location X",
            "Role X",
            "Period X",
            "Description X",
            "◦ Led project X",  # achievement for first exp
            # Second experience entry starts here
            "• Company Y",
            "Location Y",
            "Role Y",
            "Period Y",
            "Description Y",
            "◦Technologies: C#, .NET",  # technology for second exp
        ]
        result = await parse_experiences(section_lines)

        expected_first = {
            'company': "Company X",
            'location': "Location X",
            'role': "Role X",
            'period': "Period X",
            'companyDescription': "Description X",
            'techStack': [],
            'achievements': ["Led project X"],
        }
        expected_second = {
            'company': "Company Y",
            'location': "Location Y",
            'role': "Role Y",
            'period': "Period Y",
            'companyDescription': "Description Y",
            'techStack': [
                ".NET"
            ],  # Note: "C#, .NET" split on comma becomes ["C#", " .NET"] then trimmed to ["C#", ".NET"]
            'achievements': [],
        }
        # To be safe, check that Company Y's techStack has both "C#" and ".NET" if split naturally.
        # However, our expected behavior may vary. Here is an alternative expectation:
        expected_second_variant = {
            'company': "Company Y",
            'location': "Location Y",
            'role': "Role Y",
            'period': "Period Y",
            'companyDescription': "Description Y",
            'techStack': ["C#", ".NET"],
            'achievements': [],
        }
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0], expected_first)
        self.assertEqual(result[1], expected_second_variant)
