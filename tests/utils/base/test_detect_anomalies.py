from datetime import datetime, timedelta
from unittest.mock import patch

import numpy as np

from src.utils.base import detect_anomalies, validate_and_convert_transactions
from tests import BaseAsyncTestClass


class TestDetectAnomalies(BaseAsyncTestClass):
    async def asyncSetUp(self):
        # Create three dummy transactions for use in multiple tests.
        self.tx1 = self.create_transaction_dict('2024-01-01T00:00:00', 'Normal expense', -100.0, 900.0)
        self.tx2 = self.create_transaction_dict('2024-01-02T00:00:00', 'Outlier expense', -5000.0, -4100.0)
        self.tx3 = self.create_transaction_dict('2024-01-03T00:00:00', 'Normal expense', -150.0, 750.0)
        self.all_tx = await validate_and_convert_transactions([self.tx1, self.tx2, self.tx3])

    def test_stats_none_branch(self):
        """
        Test branch 1: Force find_group_key to return a key that is not in the computed pattern_stats.
        In this case, stats will be None and the transaction should be skipped.
        """
        # Patch find_group_key to always return a key that is not in group_keys.
        with patch('src.utils.base.find_group_key', return_value='nonexistent'):
            anomalies = detect_anomalies(self.all_tx)
            # Since stats is None for every transaction, no anomalies should be appended.
            self.assertEqual(anomalies, [])

    async def test_skip_regular_transactions(self):
        """
        Test branch 2: For groups with count > 3 and low standard deviation,
        the function should skip flagging them as anomalies.
        We simulate this by creating 4 transactions with nearly identical amounts.
        """
        # Create 4 transactions with identical description and nearly identical amounts.
        txs_raw = []
        base_date = datetime(2024, 1, 1)
        for i in range(4):
            # All amounts are around -100.
            txs_raw.append(
                self.create_transaction_dict(
                    (base_date + timedelta(days=i)).isoformat(),
                    'Regular expense',
                    -100.0 - (i * 0.01),
                    900.0,
                    'expense',
                )
            )
        txs = await validate_and_convert_transactions(txs_raw)
        anomalies = detect_anomalies(txs)
        # The group has count 4 and extremely low std, so anomalies should be skipped.
        self.assertEqual(anomalies, [])

    async def test_single_instance_positive_anomaly(self):
        """
        Test branch 3: For a single-instance group with a positive transaction,
        if the transaction amount is greater than global_multiplier * global_median_income,
        it should be flagged as an anomaly.
        We simulate this by creating two small positive transactions and one high outlier.
        """
        # Create two small incomes and one outlier, each with distinct descriptions.
        tx_small1 = self.create_transaction_dict('2024-01-01T00:00:00', 'Income A', 100.0, 1100.0, 'income')
        tx_small2 = self.create_transaction_dict('2024-01-02T00:00:00', 'Income B', 100.0, 1200.0, 'income')
        tx_outlier = self.create_transaction_dict('2024-01-03T00:00:00', 'Income Outlier', 500.0, 1700.0, 'income')
        # They have different descriptions so each forms its own group (count == 1).
        transactions = await validate_and_convert_transactions([tx_small1, tx_small2, tx_outlier])
        anomalies = detect_anomalies(transactions, global_multiplier=2.0)
        # Global median income for positive transactions: np.median([100, 100, 500]) = 100.
        # The outlier condition for positive transactions is: 500 > 2*100 = 200, which is true.
        # We expect the outlier to be flagged.
        # Note: The other transactions (100 and 100) are not anomalies.
        found = any(a for a in anomalies if a['amount'] == 500.0 and 'Unusual income' in a['reason'])
        self.assertTrue(found, 'Expected the high income outlier to be detected as anomaly')

    def test_zscore_anomaly(self):
        """
        Test branch 4: For groups with more than one transaction, if the computed z-score exceeds the threshold,
        an anomaly should be flagged.
        To simulate this, we force the grouping so that all transactions share the same key and then patch the computed
        statistics for that group to force a very small standard deviation.
        """
        # All transactions will share the same description, so they are grouped together.
        for tx in self.all_tx:
            tx.description = 'Test Group'

        # We'll patch the helper function 'group_transactions_by_description' to return our controlled grouping.
        def fake_group_transactions(transactions):
            # Return a group with key 'test group' with all amounts.
            return {'test group': [tx.amount for tx in transactions]}

        # Patch 'group_transactions_by_description' in the module where detect_anomalies is defined.
        with patch('src.utils.base.group_transactions_by_description', side_effect=fake_group_transactions):
            # Additionally, we patch 'find_group_key' so that it always returns 'test group'.
            with patch('src.utils.base.find_group_key', return_value='test group'):
                # Now, we want to force the pattern_stats for the group 'test group' to have a very small std.
                # We do this by temporarily patching np.mean and np.std in the context of detect_anomalies.
                # For our test, let’s simulate:
                #   mean = -100 and std = 0.001 and count = len(transactions)
                original_mean = np.mean
                original_std = np.std
                try:
                    np.mean = lambda amounts: -100
                    np.std = lambda amounts: 0.001  # force extremely low std
                    anomalies = detect_anomalies(self.all_tx, z_threshold=3.0)
                finally:
                    np.mean = original_mean
                    np.std = original_std
                # Now, for each transaction, z-score = |tx.amount - (-100)| / 1 (since std becomes 0.001 replaced by 1)
                # For tx2, amount = -5000, z = |-5000 - (-100)| = 4900, which is > 3.
                found = any(a for a in anomalies if a['amount'] == -5000.0 and 'Z-score' in a['reason'])
                self.assertTrue(found, 'Expected the outlier in a group to be flagged as anomaly based on z-score')

    def test_no_zscore_anomaly(self):
        """
        Test that if the z-score does not exceed the threshold, no anomaly is flagged.
        We simulate this by setting the group stats to produce a z-score below the threshold.
        """
        # All transactions share the same description.
        for tx in self.all_tx:
            tx.description = 'Test Group'

        def fake_group_transactions(transactions):
            return {'test group': [tx.amount for tx in transactions]}

        with patch('src.utils.base.group_transactions_by_description', side_effect=fake_group_transactions):
            with patch('src.utils.base.find_group_key', return_value='test group'):
                # Set group statistics so that the z-score is low.
                original_mean = np.mean
                original_std = np.std
                try:
                    # For instance, force mean = -100 and std = 1000, so that for tx2:
                    # z = (|-5000 - (-100)|) / 1000 = 4900/1000 = 4.9, actually that is above 3.
                    # We want a case where none exceed 3, so let’s pick std = 2000.
                    np.mean = lambda amounts: -100
                    np.std = lambda amounts: 2000
                    anomalies = detect_anomalies(self.all_tx, z_threshold=3.0)
                finally:
                    np.mean = original_mean
                    np.std = original_std
                # Now, for tx2: z = 4900/2000 = 2.45, which is below threshold.
                self.assertEqual(len(anomalies), 0, 'Expected no anomalies since z-scores are below threshold')

    async def test_negative_anomaly_zscore(self):
        """
        Test that in a group with multiple expense transactions,
        if one transaction (the outlier) has a high z-score and its description
        does not contain 'tuition' or 'rent', it is flagged as an anomaly.

        We force the z_threshold low (0.5) so that the outlier is detected.
        """
        # Create two normal expense transactions and one outlier.
        tx1 = self.create_transaction_dict('2024-01-01T00:00:00', 'Misc expense group', -100, 900)
        tx2 = self.create_transaction_dict('2024-01-02T00:00:00', 'Misc expense group', -105, 895)
        tx3 = self.create_transaction_dict('2024-01-03T00:00:00', 'Misc expense group', -1000, 400)

        transactions = await validate_and_convert_transactions([tx1, tx2, tx3])
        # Use a low z_threshold to force detection.
        anomalies = detect_anomalies(transactions, z_threshold=0.5, global_multiplier=2.0)

        # We expect an anomaly to be flagged for the outlier transaction (-1000)
        anomaly = next((a for a in anomalies if a['amount'] == -1000), None)
        self.assertIsNotNone(anomaly, 'Expected the outlier expense to be flagged as an anomaly')
        self.assertIn('Unusual expense', anomaly['reason'])
        self.assertIn('Z-score', anomaly['reason'])

    async def test_positive_anomaly_zscore(self):
        """
        Test that in a group with multiple income transactions,
        if one transaction (the outlier) has a high z-score and its description
        does not contain 'salary' or 'deposit', it is flagged as an anomaly.

        We force the z_threshold low (0.5) so that the outlier is detected.
        """
        # Create two normal income transactions and one high outlier.
        tx1 = self.create_transaction_dict('2024-01-01T00:00:00', 'Bonus Payment', 100, 1000, 'income')
        tx2 = self.create_transaction_dict('2024-01-02T00:00:00', 'Bonus Payment', 105, 1100, 'income')
        tx3 = self.create_transaction_dict('2024-01-03T00:00:00', 'Bonus Payment', 500, 1200, 'income')

        transactions = await validate_and_convert_transactions([tx1, tx2, tx3])
        anomalies = detect_anomalies(transactions, z_threshold=0.5, global_multiplier=2.0)

        # We expect an anomaly to be flagged for the outlier income (500)
        anomaly = next((a for a in anomalies if a['amount'] == 500), None)
        self.assertIsNotNone(anomaly, 'Expected the outlier income to be flagged as an anomaly')
        self.assertIn('Unusual income', anomaly['reason'])
        self.assertIn('Z-score', anomaly['reason'])


class TestDetectAnomaliesKeywordExclusion(BaseAsyncTestClass):
    async def asyncSetUp(self):
        # Create three transactions that share a common grouping key.
        # We'll later force grouping so that all transactions are in the same group.
        self.tx_normal1 = self.create_transaction_dict("2024-01-01T00:00:00", "Bonus Payment", 100, 1000, "income")
        self.tx_normal2 = self.create_transaction_dict("2024-01-02T00:00:00", "Bonus Payment", 105, 1100, "income")
        # Outlier transaction for income with a keyword that should exclude it.
        self.tx_outlier_income = self.create_transaction_dict(
            "2024-01-03T00:00:00", "Salary Bonus", 500, 1200, "income"
        )

        # Similarly, for negative transactions.
        self.tx_normal_exp1 = self.create_transaction_dict("2024-01-01T00:00:00", "Misc Expense", -100, 900)
        self.tx_normal_exp2 = self.create_transaction_dict("2024-01-02T00:00:00", "Misc Expense", -105, 895)
        # Outlier expense that includes "rent", so it should not be flagged.
        self.tx_outlier_expense = self.create_transaction_dict("2024-01-03T00:00:00", "Rent Payment", -1000, 400)

        # Prepare transactions with two normal incomes and one outlier with "salary" in its description.
        self.tx_list = await validate_and_convert_transactions(
            [self.tx_normal1, self.tx_normal2, self.tx_outlier_income]
        )

        # Prepare transactions with two normal expenses and one outlier with "rent" in its description.
        self.tx_list_ = await validate_and_convert_transactions(
            [self.tx_normal_exp1, self.tx_normal_exp2, self.tx_outlier_expense]
        )

    def patch_grouping(self, transactions):
        """
        Patch grouping functions so that all transactions are forced into one group: 'test group'.
        Also patch np.mean and np.std to force a small std for outlier detection.
        """

        def fake_group_transactions(transactions):
            # All transactions are in the group 'test group' with their amounts.
            return {'test group': [tx.amount for tx in transactions]}

        # Patch group_transactions_by_description and find_group_key.
        self.group_patch = patch(
            'src.utils.base.group_transactions_by_description', side_effect=fake_group_transactions
        )
        self.find_patch = patch('src.utils.base.find_group_key', return_value='test group')

        # Patch np.mean and np.std to force controlled statistics.
        # For instance, we force mean = 100 for income group and std = 0.001, so the outlier's z-score is huge.
        self.mean_patch = patch('numpy.mean', lambda amounts: 100 if all(a > 0 for a in amounts) else -100)
        self.std_patch = patch('numpy.std', lambda amounts: 0.001)

        self.group_patch.start()
        self.find_patch.start()
        self.mean_patch.start()
        self.std_patch.start()

        # Return the patched transactions (they remain unchanged).
        return transactions

    def unpatch_all(self):
        self.group_patch.stop()
        self.find_patch.stop()
        self.mean_patch.stop()
        self.std_patch.stop()

    def test_positive_keyword_exclusion(self):
        """
        For income transactions: if the description contains 'salary' or 'deposit',
        even if the z-score is high, the transaction should not be flagged as an anomaly.
        """

        # Convert transactions if needed.
        # We patch the grouping so that all transactions belong to 'test group'
        self.patch_grouping(self.tx_list)
        # Use a low z_threshold so that normally the outlier would be flagged.
        anomalies = detect_anomalies(self.tx_list, z_threshold=0.5, global_multiplier=2.0)
        self.unpatch_all()
        # Expect that no anomaly is flagged for the outlier income because its description contains 'salary'
        found = any(a for a in anomalies if a['amount'] == self.tx_outlier_income['amount'])
        self.assertFalse(found, "Expected no anomaly for income transaction with 'salary' in description.")

    def test_negative_keyword_exclusion(self):
        """
        For expense transactions: if the description contains 'tuition' or 'rent',
        even if the z-score is high, the transaction should not be flagged as an anomaly.
        """

        self.patch_grouping(self.tx_list_)
        anomalies = detect_anomalies(self.tx_list_, z_threshold=0.5, global_multiplier=2.0)
        self.unpatch_all()
        # Expect that no anomaly is flagged for the outlier expense because its description contains 'rent'
        found = any(a for a in anomalies if a['amount'] == self.tx_outlier_expense['amount'])
        self.assertFalse(found, "Expected no anomaly for expense transaction with 'rent' in description.")
