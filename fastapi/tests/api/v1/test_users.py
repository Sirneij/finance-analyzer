import uuid
from unittest.mock import patch

import pytest
from fastapi import status
from sqlalchemy.exc import IntegrityError


class TestUsers:
    @pytest.fixture(autouse=True)
    def setup(self, client):
        self.client = client
        self.base_url = '/api/v1/users'
        self.test_user_data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'testpassword123',
        }

    def test_get_users_empty(self):
        response = self.client.get(f'{self.base_url}/')
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)
        data = response.json()
        assert len(data) == 0

    def test_get_user_not_found(self):
        random_uuid = uuid.uuid4()
        response = self.client.get(f'{self.base_url}/{random_uuid}')
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json() == {'detail': 'User not found'}

    def test_password_hashing(self):
        response = self.client.post(
            f'{self.base_url}/register', json=self.test_user_data
        )
        assert response.status_code == status.HTTP_201_CREATED

        # Retrieve user details from database (assuming direct access to the database session)
        created_user_id = response.json()['id']
        user = self.client.get(f'{self.base_url}/{created_user_id}/').json()

        # Ensure the plain password is not stored
        assert user.get('password') is None
        assert 'hashed_password' not in user

    def test_create_and_get_user(self):
        # Create user
        create_response = self.client.post(
            f'{self.base_url}/register', json=self.test_user_data
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        created_user = create_response.json()

        # Get created user
        get_response = self.client.get(f'{self.base_url}/{created_user["id"]}/')
        assert get_response.status_code == status.HTTP_200_OK
        assert get_response.json()['email'] == self.test_user_data['email']
        assert get_response.json()['name'] == self.test_user_data['name']
        assert 'hashed_password' not in get_response.json()

    def test_get_users_with_data(self):
        # Create a user first
        create_response = self.client.post(
            f'{self.base_url}/register', json=self.test_user_data
        )
        assert create_response.status_code == status.HTTP_201_CREATED

        # Get users list
        response = self.client.get(f'{self.base_url}/')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        user = data[0]
        assert isinstance(user["id"], str)
        assert user['email'] == self.test_user_data['email']
        assert user['name'] == self.test_user_data['name']
        assert isinstance(user['is_active'], bool)
        assert isinstance(user['is_superuser'], bool)

    def test_get_user_response_fields(self):
        # Create user first
        create_response = self.client.post(
            f'{self.base_url}/register', json=self.test_user_data
        )
        user_id = create_response.json()['id']

        # Get user and verify response structure
        response = self.client.get(f'{self.base_url}/{user_id}/')
        assert response.status_code == status.HTTP_200_OK
        user = response.json()
        assert isinstance(user['id'], str)
        assert user['email'] == self.test_user_data['email']
        assert user['name'] == self.test_user_data['name']
        assert isinstance(user['is_active'], bool)
        assert isinstance(user['is_superuser'], bool)
        assert "hashed_password" not in user
        assert 'date_joined' not in user

    def test_create_user_response_fields(self):
        response = self.client.post(
            f'{self.base_url}/register', json=self.test_user_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        user = response.json()
        assert isinstance(user['id'], str)
        assert user['email'] == self.test_user_data['email']
        assert user['name'] == self.test_user_data['name']
        assert isinstance(user['is_active'], bool)
        assert isinstance(user['is_superuser'], bool)
        assert 'hashed_password' not in user
        assert 'date_joined' not in user

    def test_create_user_duplicate_email(self):
        # First creation
        first_response = self.client.post(
            f'{self.base_url}/register', json=self.test_user_data
        )
        assert first_response.status_code == status.HTTP_201_CREATED

        # Duplicate creation
        second_response = self.client.post(
            f'{self.base_url}/register', json=self.test_user_data
        )
        assert second_response.status_code == status.HTTP_400_BAD_REQUEST
        assert second_response.json() == {'detail': 'Email already exists'}

    def test_create_user_missing_fields(self):
        incomplete_data = [
            {'email': 'test@example.com', 'password': 'password123'},  # Missing name
            {'name': 'Test User', 'password': 'password123'},  # Missing email
            {'name': 'Test User', 'email': 'test@example.com'},  # Missing password
        ]
        for data in incomplete_data:
            response = self.client.post(f'{self.base_url}/register', json=data)
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_create_user_invalid_field_types(self):
        invalid_data = [
            {
                'name': 123,
                'email': 'test@example.com',
                'password': 'password123',
            },  # Invalid name type
            {
                'name': 'Test User',
                'email': 123,
                'password': 'password123',
            },  # Invalid email type
            {
                'name': 'Test User',
                'email': 'test@example.com',
                'password': 123,
            },  # Invalid password type
        ]
        for data in invalid_data:
            response = self.client.post(f'{self.base_url}/register', json=data)
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_user_invalid_id_format(self):
        response = self.client.get(f'{self.base_url}/invalid-uuid/')
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
