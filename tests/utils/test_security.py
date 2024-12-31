import unittest

from app.utils.security import get_password_hash, verify_password


class TestPasswordSecurity(unittest.TestCase):

    def test_verify_password_success(self):
        password = 'correct_password123'
        hashed = get_password_hash(password)
        self.assertTrue(verify_password(password, hashed))

    def test_verify_password_failure(self):
        password = 'correct_password123'
        wrong_password = 'wrong_password123'
        hashed = get_password_hash(password)
        self.assertFalse(verify_password(wrong_password, hashed))

    def test_verify_empty_password(self):
        empty_password = ''
        hashed = get_password_hash(empty_password)
        self.assertTrue(verify_password(empty_password, hashed))
        self.assertFalse(verify_password('some_password', hashed))

    def test_verify_password_case_sensitive(self):
        password = 'Password123'
        hashed = get_password_hash(password)
        self.assertFalse(verify_password('password123', hashed))
        self.assertFalse(verify_password('PASSWORD123', hashed))

    def test_verify_password_with_special_chars(self):
        password = 'Pass@#$%^&*()'
        hashed = get_password_hash(password)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password('Pass@#$%^&*()1', hashed))

    def test_verify_password_with_whitespace(self):
        password = 'password with spaces'
        hashed = get_password_hash(password)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password('passwordwithspaces', hashed))

    def test_verify_password_with_unicode(self):
        password = 'パスワード123'
        hashed = get_password_hash(password)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password('password123', hashed))

    def test_verify_long_password(self):
        password = 'a' * 100
        hashed = get_password_hash(password)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password('a' * 99, hashed))

    def test_get_password_hash_uniqueness(self):
        password = 'same_password'
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        self.assertNotEqual(hash1, hash2)
        self.assertTrue(verify_password(password, hash1))
        self.assertTrue(verify_password(password, hash2))
