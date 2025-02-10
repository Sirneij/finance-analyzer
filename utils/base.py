from datetime import datetime
from typing import List

import torch

from models.base import Transaction


async def validate_and_convert_transactions(transactions: list[dict]) -> List[Transaction]:
    """
    Validate a list of transaction dictionaries and return a list of Transaction objects.

    The function:
      - Requires the following fields: '_id', 'date', 'description', 'amount',
        'balance', 'type', 'userId', 'createdAt', 'updatedAt'.
      - Filters out the '__v' field if present.
      - Converts 'amount' and 'balance' to floats.
      - Converts 'date', 'createdAt', and 'updatedAt' from strings to datetime objects
        (if they are supplied as strings).
    """
    valid_transactions = []
    # Define all required fields (including _id, createdAt, and updatedAt)
    required_fields = {'_id', 'date', 'description', 'amount', 'balance', 'type', 'userId', 'createdAt', 'updatedAt'}

    for t in transactions:
        # Skip if any required field is missing.
        if not all(field in t for field in required_fields):
            continue

        try:
            # Create a filtered copy that removes the '__v' field, if present.
            data = {k: v for k, v in t.items() if k != '__v'}

            # Convert numeric fields
            data['amount'] = float(data['amount'])
            data['balance'] = float(data['balance'])

            # Convert date fields if they are strings
            if isinstance(data['date'], str):
                data['date'] = datetime.fromisoformat(data['date'])
            if isinstance(data['createdAt'], str):
                data['createdAt'] = datetime.fromisoformat(data['createdAt'])
            if isinstance(data['updatedAt'], str):
                data['updatedAt'] = datetime.fromisoformat(data['updatedAt'])

            # Create the Transaction dataclass instance
            transaction_obj = Transaction(
                _id=data['_id'],
                amount=data['amount'],
                balance=data['balance'],
                createdAt=data['createdAt'],
                date=data['date'],
                description=data['description'],
                type=data['type'],
                updatedAt=data['updatedAt'],
                userId=data['userId'],
            )

            valid_transactions.append(transaction_obj)
        except (ValueError, TypeError):
            # Skip this transaction if any conversion fails.
            continue

    return valid_transactions


def get_device() -> tuple[torch.device, str]:
    if torch.cuda.is_available():
        return torch.device('cuda'), 'CUDA (NVIDIA GPU)'
    elif torch.backends.mps.is_available():
        return torch.device('mps'), 'MPS (Apple Metal)'
    else:
        return torch.device('cpu'), 'CPU'
