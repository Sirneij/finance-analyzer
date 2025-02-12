from src.utils.base import find_group_key
from tests import BaseTestClass


class TestFindGroupKey(BaseTestClass):
    def test_find_group_key_no_match(self):
        description = 'apple'
        # Provide group_keys that are dissimilar enough so that no match is found.
        group_keys = ['banana', 'orange']
        # With a cutoff of 0.69, there should be no close matches.
        result = find_group_key(description, group_keys, cutoff=0.69)
        # The function should return the original description.
        self.assertEqual(result, description)
