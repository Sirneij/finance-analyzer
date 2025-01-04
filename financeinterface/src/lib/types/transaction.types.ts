export interface Transaction {
	_id: string;
	userId: string;
	date: string;
	amount: number;
	balance: number;
	description: string;
	type: 'income' | 'expense';
	createdAt: Date;
	updatedAt: Date;
}

export interface FinancialStats {
	total: number;
	change: number;
	trend: 'up' | 'down' | 'neutral';
}
