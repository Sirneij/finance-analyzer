from src.utils.resume_parser import (
    parse_skills,
    parse_summary,
    split_on_commas_outside_parentheses,
)
from tests import BaseAsyncTestClass


class TestParseSkillsSplitOnCommaParseSummary(BaseAsyncTestClass):
    """Test the `parse_skills` function."""

    def test_split_on_commas_outside_parentheses_simple(self):
        s = 'HTML, CSS, JavaScript'
        expected = ['HTML', ' CSS', ' JavaScript']
        self.assertEqual(split_on_commas_outside_parentheses(s), expected)

    def test_split_on_commas_outside_parentheses_with_parentheses(self):
        s = 'Python 3 (Django), PostgreSQL, JavaScript (jQuery, ReactNative)'
        expected = ['Python 3 (Django)', ' PostgreSQL', ' JavaScript (jQuery, ReactNative)']
        self.assertEqual(split_on_commas_outside_parentheses(s), expected)

    def test_split_on_commas_outside_parentheses_no_comma(self):
        s = 'OnlyOneSkill'
        expected = ['OnlyOneSkill']
        self.assertEqual(split_on_commas_outside_parentheses(s), expected)

    def test_split_on_commas_outside_parentheses_empty(self):
        s = ''
        expected = ['']
        self.assertEqual(split_on_commas_outside_parentheses(s), expected)

    def test_split_on_commas_inside_parentheses(self):
        s = 'Skill (a, b, c)'
        expected = ['Skill (a, b, c)']
        self.assertEqual(split_on_commas_outside_parentheses(s), expected)

    async def test_parse_summary_single_line(self):
        section_lines = ['Experienced professional.']
        result = await parse_summary(section_lines)
        self.assertEqual(result, 'Experienced professional.')

    async def test_parse_summary_multiple_lines(self):
        section_lines = ['Experienced', 'professional', 'in Python.']
        result = await parse_summary(section_lines)
        self.assertEqual(result, 'Experienced professional in Python.')

    async def test_parse_summary_empty(self):
        section_lines = []
        result = await parse_summary(section_lines)
        self.assertEqual(result, '')

    async def test_parse_skills_valid_single_category(self):
        # Single bullet with trailing period on one skill
        section_lines = ['• Programming: Python, C++, Java.']
        result = await parse_skills(section_lines)
        expected = {'Programming': ['Python', 'C++', 'Java']}
        self.assertEqual(result, expected)

    async def test_parse_skills_valid_multiple_categories(self):
        section_lines = ['• Frontend: HTML, CSS, JavaScript.', '• Backend: Python, Node.js, Go.']
        result = await parse_skills(section_lines)
        expected = {'Frontend': ['HTML', 'CSS', 'JavaScript'], 'Backend': ['Python', 'Node.js', 'Go']}
        self.assertEqual(result, expected)

    async def test_parse_skills_mixed_whitespace(self):
        section_lines = ['• Databases:  PostgreSQL ,    MySQL,SQLite.']
        result = await parse_skills(section_lines)
        expected = {'Databases': ['PostgreSQL', 'MySQL', 'SQLite']}
        self.assertEqual(result, expected)

    async def test_parse_skills_missing_bullet(self):
        section_lines = ['Some random text', '• Tools: Git, Docker.']
        result = await parse_skills(section_lines)
        expected = {'Tools': ['Git', 'Docker']}
        self.assertEqual(result, expected)

    async def test_parse_skills_empty_skills(self):
        section_lines = ['• Empty: ']
        result = await parse_skills(section_lines)
        # Note: When skills_raw is empty, split returns [''] which remains as an empty string after rstrip('.')
        expected = {'Empty': ['']}
        self.assertEqual(result, expected)

    async def test_parse_skills_no_match(self):
        section_lines = ["Random text that doesn't match", 'Another line without a bullet']
        result = await parse_skills(section_lines)
        expected = {}
        self.assertEqual(result, expected)
