from src.utils.resume_parser import parse_contact_info
from tests import BaseAsyncTestClass


class TestParseContactInfo(BaseAsyncTestClass):
    """Test the `parse_contact_info` function."""

    async def test_empty_lines(self):
        # When no lines are provided, all fields should be empty.
        lines = []
        result = await parse_contact_info(lines)
        expected = {
            'name': '',
            'title': '',
            'contact': {
                'phone': '',
                'email': '',
                'github': '',
                'linkedin': '',
                'location': '',
                'website': '',
            },
        }
        self.assertEqual(result, expected)

    async def test_single_line(self):
        # Only name provided.
        lines = ["John Doe"]
        result = await parse_contact_info(lines)
        expected = {
            'name': "John Doe",
            'title': '',
            'contact': {
                'phone': '',
                'email': '',
                'github': '',
                'linkedin': '',
                'location': '',
                'website': '',
            },
        }
        self.assertEqual(result, expected)

    async def test_two_lines(self):
        # Name and phone provided.
        lines = ["John Doe", "123-456-7890"]
        result = await parse_contact_info(lines)
        expected = {
            'name': "John Doe",
            'title': '',
            'contact': {
                'phone': "123-456-7890",
                'email': '',
                'github': '',
                'linkedin': '',
                'location': '',
                'website': '',
            },
        }
        self.assertEqual(result, expected)

    async def test_three_lines(self):
        # Name, phone, and title provided.
        lines = ["John Doe", "123-456-7890", "Software Engineer"]
        result = await parse_contact_info(lines)
        expected = {
            'name': "John Doe",
            'title': "Software Engineer",
            'contact': {
                'phone': "123-456-7890",
                'email': '',
                'github': '',
                'linkedin': '',
                'location': '',
                'website': '',
            },
        }
        self.assertEqual(result, expected)

    async def test_four_lines(self):
        # Name, phone, title, and email provided.
        lines = ["John Doe", "123-456-7890", "Software Engineer", "john@example.com"]
        result = await parse_contact_info(lines)
        expected = {
            'name': "John Doe",
            'title': "Software Engineer",
            'contact': {
                'phone': "123-456-7890",
                'email': "john@example.com",
                'github': '',
                'linkedin': '',
                'location': '',
                'website': '',
            },
        }
        self.assertEqual(result, expected)

    async def test_five_lines(self):
        # Providing up to github.
        lines = [
            "John Doe",
            "123-456-7890",
            "Software Engineer",
            "john@example.com",
            "johndoe",
        ]
        result = await parse_contact_info(lines)
        expected = {
            'name': "John Doe",
            'title': "Software Engineer",
            'contact': {
                'phone': "123-456-7890",
                'email': "john@example.com",
                'github': "johndoe",
                'linkedin': '',
                'location': '',
                'website': '',
            },
        }
        self.assertEqual(result, expected)

    async def test_six_lines(self):
        # Providing up to linkedin.
        lines = [
            "John Doe",
            "123-456-7890",
            "Software Engineer",
            "john@example.com",
            "johndoe",
            "linkedin.com/in/johndoe",
        ]
        result = await parse_contact_info(lines)
        expected = {
            'name': "John Doe",
            'title': "Software Engineer",
            'contact': {
                'phone': "123-456-7890",
                'email': "john@example.com",
                'github': "johndoe",
                'linkedin': "linkedin.com/in/johndoe",
                'location': '',
                'website': '',
            },
        }
        self.assertEqual(result, expected)

    async def test_seven_lines(self):
        # Providing up to location.
        lines = [
            "John Doe",
            "123-456-7890",
            "Software Engineer",
            "john@example.com",
            "johndoe",
            "linkedin.com/in/johndoe",
            "San Francisco, CA",
        ]
        result = await parse_contact_info(lines)
        expected = {
            'name': "John Doe",
            'title': "Software Engineer",
            'contact': {
                'phone': "123-456-7890",
                'email': "john@example.com",
                'github': "johndoe",
                'linkedin': "linkedin.com/in/johndoe",
                'location': "San Francisco, CA",
                'website': '',
            },
        }
        self.assertEqual(result, expected)

    async def test_all_fields(self):
        # Providing all eight fields.
        lines = [
            "John Doe",
            "123-456-7890",
            "Software Engineer",
            "john@example.com",
            "johndoe",
            "linkedin.com/in/johndoe",
            "San Francisco, CA",
            "johndoe.com",
        ]
        result = await parse_contact_info(lines)
        expected = {
            'name': "John Doe",
            'title': "Software Engineer",
            'contact': {
                'phone': "123-456-7890",
                'email': "john@example.com",
                'github': "johndoe",
                'linkedin': "linkedin.com/in/johndoe",
                'location': "San Francisco, CA",
                'website': "johndoe.com",
            },
        }
        self.assertEqual(result, expected)

    async def test_extra_lines_ignored(self):
        # When extra lines are provided, only the first eight are considered.
        lines = [
            "John Doe",
            "123-456-7890",
            "Software Engineer",
            "john@example.com",
            "johndoe",
            "linkedin.com/in/johndoe",
            "San Francisco, CA",
            "johndoe.com",
            "Extra Line",
            "Another Extra Line",
        ]
        result = await parse_contact_info(lines)
        expected = {
            'name': "John Doe",
            'title': "Software Engineer",
            'contact': {
                'phone': "123-456-7890",
                'email': "john@example.com",
                'github': "johndoe",
                'linkedin': "linkedin.com/in/johndoe",
                'location': "San Francisco, CA",
                'website': "johndoe.com",
            },
        }
        self.assertEqual(result, expected)
