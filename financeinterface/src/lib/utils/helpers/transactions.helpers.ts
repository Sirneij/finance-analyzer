import type { Categories, SpendingReport } from '$lib/types/transaction.types';

export function transformCategoriesToArray(categories: Categories) {
	return Object.entries(categories)
		.filter(([_, value]) => value > 0)
		.map(([key, value]) => ({
			title: key.charAt(0).toUpperCase() + key.slice(1),
			value: `${(value * 100).toFixed(1)}%`,
			description: `${(value * 100).toFixed(1)}% of total spending`
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

export async function getTransactionAnalysis(): Promise<SpendingReport> {
	try {
		const response = await fetch('/api/transactions/analyze');
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching transaction analysis:', error);
		return {} as SpendingReport;
	}
}
