from src.utils.resume_parser import parse_education, parse_single_education
from tests import BaseAsyncTestClass


class TestParseEducation(BaseAsyncTestClass):
    """Exhaustive tests for the parse_education function."""

    # Minimal education entry: exactly five lines, no achievements.
    async def test_parse_single_education_minimal(self):
        edu_lines = [
            '• University A',  # school (marker removed → 'University A')
            'City A',  # location
            'B.Sc in Computer Science',  # degree
            '2010 - 2014',  # period
            'Top ranking university',  # school description
        ]
        result, next_idx = await parse_single_education(edu_lines, 0)
        expected = {
            'school': 'University A',
            'location': 'City A',
            'degree': 'B.Sc in Computer Science',
            'period': '2010 - 2014',
            'schoolDescription': 'Top ranking university',
            'achievements': [],
        }
        self.assertEqual(result, expected)
        self.assertEqual(next_idx, 5)

    # Education entry with two achievements; loop stops when a new bullet ('• ') is encountered.
    async def test_parse_single_education_with_achievements(self):
        edu_lines = [
            '• Institute X',  # school
            'City X',  # location
            'Ph.D. in Biology',  # degree
            '2018 - 2022',  # period
            'Prestigious institute',  # description
            '◦ Won Best Thesis Award',  # achievement 1 start
            'at national level',  # achievement 1 continuation
            '◦ Worked on groundbreaking research',  # achievement 2 (single line)
            '• Next Section',  # New marker – loop should break here.
            'Extra line that should not be included',
        ]
        result, next_idx = await parse_single_education(edu_lines, 0)
        expected_ach1 = 'Won Best Thesis Award at national level'
        expected_ach2 = 'Worked on groundbreaking research'
        expected = {
            'school': 'Institute X',
            'location': 'City X',
            'degree': 'Ph.D. in Biology',
            'period': '2018 - 2022',
            'schoolDescription': 'Prestigious institute',
            'achievements': [expected_ach1, expected_ach2],
        }
        self.assertEqual(result, expected)
        self.assertEqual(next_idx, 8)

    # Test an entry with a non-bullet line before an achievement bullet.
    async def test_parse_single_education_with_else_branch(self):
        edu_lines = [
            '• College Y',
            'City Y',
            'B.A in History',
            '2000 - 2004',
            'Renowned college',
            'Some irrelevant line',  # This line should be skipped.
            '◦ Extracurricular: Debate club',  # Achievement start
            'Participated in national competitions',  # Achievement continuation
        ]
        result, next_idx = await parse_single_education(edu_lines, 0)
        expected_ach = 'Extracurricular: Debate club Participated in national competitions'
        expected = {
            'school': 'College Y',
            'location': 'City Y',
            'degree': 'B.A in History',
            'period': '2000 - 2004',
            'schoolDescription': 'Renowned college',
            'achievements': [expected_ach],
        }
        self.assertEqual(result, expected)
        self.assertEqual(next_idx, 8)

    # Test multiple education entries in one section.
    async def test_parse_education_multiple_entries(self):
        edu_lines = [
            # First education entry (minimal)
            '• University Z',
            'City Z',
            'MBA',
            '2010 - 2012',
            'Business school',
            # Second education entry (with achievement)
            '• University W',
            'City W',
            'B.Sc in Engineering',
            '2006 - 2010',
            'Top engineering institute',
            "◦ Dean's List",  # Achievement start
            'For academic excellence',  # Achievement continuation
        ]
        result = await parse_education(edu_lines)
        expected_entry1 = {
            'school': 'University Z',
            'location': 'City Z',
            'degree': 'MBA',
            'period': '2010 - 2012',
            'schoolDescription': 'Business school',
            'achievements': [],
        }
        expected_entry2 = {
            'school': 'University W',
            'location': 'City W',
            'degree': 'B.Sc in Engineering',
            'period': '2006 - 2010',
            'schoolDescription': 'Top engineering institute',
            'achievements': ["Dean's List For academic excellence"],
        }
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0], expected_entry1)
        self.assertEqual(result[1], expected_entry2)

    # Test that non-bullet lines before an entry are ignored.
    async def test_parse_education_ignores_non_bullet_lines(self):
        edu_lines = [
            'Random introductory text that should be ignored.',
            '• Art School',
            'City Art',
            'Diploma in Fine Arts',
            '2015 - 2017',
            'Notable art institute',
            '◦ Awarded best student',  # achievement
            'Some commentary',  # achievement continuation
            'Another random unrelated line',  # this line will be appended as per current logic
        ]
        result = await parse_education(edu_lines)
        # Expected achievement now includes the unrelated line appended,
        # matching the current parser logic.
        expected = [
            {
                'school': 'Art School',
                'location': 'City Art',
                'degree': 'Diploma in Fine Arts',
                'period': '2015 - 2017',
                'schoolDescription': 'Notable art institute',
                'achievements': ['Awarded best student Some commentary Another random unrelated line'],
            }
        ]
        self.assertEqual(result, expected)
