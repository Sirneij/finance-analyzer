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

export interface Categories {
	[key: string]: number;
}

export interface CategoriesData {
	expenses: Categories;
	expense_percentages: Categories;
	income: number;
}

export interface Anomaly {
	date: string;
	description: string;
	amount: number;
	reason: string;
}

export interface SpendingAnalysis {
	total_spent: number;
	total_income: number;
	savings_rate: number;
	daily_summary: Categories;
	cumulative_balance: Categories;
}

export interface SpendingTrends {
	trend: 'increasing' | 'decreasing' | 'stable';
	trend_slope: number;
	estimated_monthly_spend: number;
}

export interface SpendingReport {
	categories: CategoriesData;
}

export interface InsightMetric {
	title: string;
	value: string;
	trend: 'positive' | 'negative' | 'neutral';
	description: string;
}

export interface RecurringTransaction {
	description: string;
	amount: number;
	frequency: string;
	confidence: string;
}

export interface FinancialHealth {
	debt_to_income_ratio: number;
	savings_rate: number;
	balance_growth_rate: number;
	financial_health_score: number;
}

export interface FinancialSummary {
	income: FinancialStats;
	expenses: FinancialStats;
	savings: FinancialStats;
	total_transactions: number;
	expense_count: number;
	income_count: number;
	avg_expense: number;
	avg_income: number;
	start_date: string;
	end_date: string;
	largest_expense: number;
	largest_income: number;
	savings_rate: number;
	monthly_summary: Record<string, any>;
	anomalies: Anomaly[];
	spending_analysis: SpendingAnalysis;
	spending_trends: SpendingTrends;
	recurring_transactions: RecurringTransaction[];
	financial_health: FinancialHealth;
}

export interface PaginationMetadata {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
