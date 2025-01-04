from dataclasses import dataclass
from datetime import datetime


@dataclass
class Transaction:
    _id: str
    amount: float
    balance: float
    createdAt: datetime
    date: datetime
    description: str
    type: str
    updatedAt: datetime
    userId: str
