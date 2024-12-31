import unittest

from pydantic import ValidationError

from app.schemas.users import UserBase, UserCreate, UserRead


class TestUserSchemas(unittest.TestCase):
    def setUp(self):
        self.valid_user_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'id': '123',
            'is_active': True,
            'is_superuser': False,
        }

    def test_valid_user_base(self):
        user = UserBase(
            name=self.valid_user_data['name'], email=self.valid_user_data['email']
        )
        self.assertEqual(user.name, self.valid_user_data['name'])
        self.assertEqual(user.email, self.valid_user_data['email'])

    def test_invalid_name_length(self):
        with self.assertRaises(ValidationError):
            UserBase(name='Jo', email='john@example.com')
        with self.assertRaises(ValidationError):
            UserBase(name='J' * 256, email='john@example.com')

    def test_invalid_email_format(self):
        with self.assertRaises(ValidationError):
            UserBase(name='John Doe', email='invalid-email')

    def test_user_create_password_validation(self):
        valid_data = {**self.valid_user_data, 'password': 'secure123'}
        user = UserCreate(**valid_data)
        self.assertEqual(user.password, 'secure123')

        with self.assertRaises(ValidationError):
            UserCreate(**{**self.valid_user_data, 'password': 'short'})

    def test_user_read_model(self):
        user = UserRead(**self.valid_user_data)
        self.assertEqual(user.id, self.valid_user_data['id'])
        self.assertEqual(user.is_active, self.valid_user_data['is_active'])
        self.assertEqual(user.is_superuser, self.valid_user_data['is_superuser'])
