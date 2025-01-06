import { type ChartConfiguration, type ChartOptions } from 'chart.js';

const options: ChartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	animation: {
		duration: 2000,
		easing: 'easeInOutQuart'
	},
	plugins: {
		legend: {
			display: false
		},
		tooltip: {
			callbacks: {
				label: function (context) {
					const label = context.dataset.label || '';
					if (label) {
						return `${label}: $${context.parsed.y.toLocaleString()}`;
					}
					return `$${context.parsed.y.toLocaleString()}`;
				},
				title: function (context) {
					return context[0]?.label ?? '';
				}
			}
		}
	},
	scales: {
		y: {
			beginAtZero: true,
			ticks: {
				callback: function (tickValue: number | string, index: number, ticks: any[]): string {
					return `$${tickValue.toLocaleString()}`;
				}
			}
		},
		x: {
			grid: {
				display: false
			}
		}
	}
};

export const financialChartConfig: ChartConfiguration = {
	type: 'line',
	data: {
		labels: [],
		datasets: []
	},
	options: {
		...options
	}
};

export const spendingCategoriesChartConfig: ChartConfiguration = {
	type: 'bar',
	data: {
		labels: [],
		datasets: []
	},
	options: {
		...options
	}
};
export function generateChartColors(count: number) {
	const backgroundColors: string[] = [];
	const borderColors: string[] = [];

	for (let i = 0; i < count; i++) {
		const hue = (i * 360) / count;
		backgroundColors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
		borderColors.push(`hsla(${hue}, 70%, 60%, 1)`);
	}

	return { backgroundColors, borderColors };
}

export const monthlySummariesChartConfig: ChartConfiguration = {
	type: 'line',
	data: {
		labels: [],
		datasets: []
	},
	options: {
		...options
	}
};
