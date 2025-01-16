import type { CategoriesData, InsightMetric, SpendingReport } from '$lib/types/transaction.types';

export function transformCategoriesToArray(categoryData: CategoriesData) {
	return Object.entries(categoryData.percentages)
		.filter(([_, value]) => value > 0)
		.map(([key, percentage]) => ({
			title: key.charAt(0).toUpperCase() + key.slice(1),
			value: `${percentage.toFixed(2)}%`,
			description: `$${categoryData.categories[key].toLocaleString()} (${percentage.toFixed(2)}% of total spending)`
		}));
}

export function transformChartData(
	rawData1: Record<string, number>,
	rawData2: Record<string, number>
) {
	const chartData = Object.entries(rawData1).map(([date, amount]) => ({
		date,
		income: amount > 0 ? amount : 0,
		expenses: amount < 0 ? Math.abs(amount) : 0,
		balance: 0
	}));

	// Add balance data
	Object.entries(rawData2).forEach(([date, balance]) => {
		const existingEntry = chartData.find((item) => item.date === date);
		if (existingEntry) {
			existingEntry.balance = balance;
		}
	});

	return {
		labels: chartData.map((item) => new Date(item.date).toLocaleDateString()),
		income: chartData.map((item) => item.income),
		expenses: chartData.map((item) => item.expenses),
		balances: chartData.map((item) => item.balance)
	};
}

export function transformMonthlyChartData(monthlySummary: Record<string, any>) {
	const labels: string[] = [];
	const incomeData: number[] = [];
	const expensesData: number[] = [];
	const savingsData: number[] = [];

	// Iterate through the monthly summary data
	for (const [month, data] of Object.entries(monthlySummary)) {
		labels.push(month); // Use the month (e.g., "2023-01") as the label
		incomeData.push(data.income || 0);
		expensesData.push(data.expenses || 0);
		savingsData.push(data.savings || 0);
	}

	return {
		labels,
		incomeData,
		expensesData,
		savingsData
	};
}

export async function getTransactionAnalysis(): Promise<SpendingReport> {
	try {
		const response = await fetch('/finanalyzer/api/transactions/analyze');
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching transaction analysis:', error);
		return {} as SpendingReport;
	}
}

export function getFinancialInsights(data: SpendingReport): InsightMetric[] {
	return [
		{
			title: 'Spending Trend',
			value: Math.abs(data.spending_trends.trend_slope).toFixed(2),
			trend: data.spending_trends.trend === 'increasing' ? 'negative' : 'positive',
			description: `Your spending is ${data.spending_trends.trend}. On average, it changes by $${Math.abs(data.spending_trends.trend_slope).toFixed(2)} per day.`
		},
		{
			title: 'Saving Rate',
			value: Math.abs(data.spending_analysis.savings_rate).toFixed(2),
			trend: data.spending_analysis.savings_rate > 0 ? 'positive' : 'negative',
			description: 'Your saving rate is the percentage of your income that you save each month.'
		}
	];
}
