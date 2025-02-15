from dataclasses import dataclass
from datetime import datetime
from typing import TypedDict


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


class RecurringTransaction(TypedDict):
    description: str
    amount: float
    frequency: str
    confidence: str
