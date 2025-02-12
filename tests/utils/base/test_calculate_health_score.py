from src.utils.base import calculate_health_score
from tests import BaseTestClass


class TestCalculateHealthScore(BaseTestClass):
    def test_high_debt_high_savings_high_growth(self):
        """
        debt_ratio > 0.43, savings_rate >= 20, balance_growth > 10.
        Expected: 100 - 40 + 20 + 10 = 90.
        """
        score = calculate_health_score(debt_ratio=0.5, savings_rate=25, balance_growth=15)
        self.assertEqual(score, 90)

    def test_high_debt_high_savings_negative_growth(self):
        """
        debt_ratio > 0.43, savings_rate >= 20, balance_growth < -10.
        Expected: 100 - 40 + 20 - 10 = 70.
        """
        score = calculate_health_score(debt_ratio=0.5, savings_rate=25, balance_growth=-20)
        self.assertEqual(score, 70)

    def test_high_debt_low_savings_neutral_growth(self):
        """
        debt_ratio > 0.43, savings_rate < 10, balance_growth in between.
        Expected: 100 - 40 = 60.
        """
        score = calculate_health_score(debt_ratio=0.5, savings_rate=5, balance_growth=0)
        self.assertEqual(score, 60)

    def test_mid_debt_mid_savings_neutral_growth(self):
        """
        0.36 < debt_ratio <= 0.43, savings_rate between 10 and 20, neutral growth.
        Expected: 100 - 15 + 10 = 95.
        """
        score = calculate_health_score(debt_ratio=0.4, savings_rate=15, balance_growth=0)
        self.assertEqual(score, 95)

    def test_low_debt_low_savings_neutral_growth(self):
        """
        debt_ratio <= 0.36, savings_rate < 10, neutral growth.
        Expected: no changes, score remains 100.
        """
        score = calculate_health_score(debt_ratio=0.35, savings_rate=5, balance_growth=0)
        self.assertEqual(score, 100)

    def test_low_debt_high_savings_high_growth_clamped(self):
        """
        debt_ratio <= 0.36, savings_rate >= 20, balance_growth > 10.
        Expected: 100 + 20 + 10 = 130, but clamped to 100.
        """
        score = calculate_health_score(debt_ratio=0.35, savings_rate=30, balance_growth=15)
        self.assertEqual(score, 100)

    def test_high_debt_low_savings_negative_growth(self):
        """
        debt_ratio > 0.43, savings_rate < 10, balance_growth < -10.
        Expected: 100 - 40 - 10 = 50.
        """
        score = calculate_health_score(debt_ratio=0.5, savings_rate=5, balance_growth=-20)
        self.assertEqual(score, 50)

    def test_border_debt_at_0_43(self):
        """
        When debt_ratio is exactly 0.43:
          - It is not > 0.43 so the first branch is skipped.
          - But 0.43 > 0.36 is True, so subtract 15.
          - Savings_rate of 15 (between 10 and 20) adds 10.
          Expected: 100 - 15 + 10 = 95.
        """
        score = calculate_health_score(debt_ratio=0.43, savings_rate=15, balance_growth=0)
        self.assertEqual(score, 95)

    def test_border_debt_at_0_36(self):
        """
        When debt_ratio is exactly 0.36:
          - It is not > 0.36 so no penalty is applied.
          - Savings_rate of 15 adds 10.
          Expected: 100 + 10 = 110, but clamped to 100.
        """
        score = calculate_health_score(debt_ratio=0.36, savings_rate=15, balance_growth=0)
        self.assertEqual(score, 100)
