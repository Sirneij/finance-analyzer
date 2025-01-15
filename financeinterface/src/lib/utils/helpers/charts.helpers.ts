import { type ChartConfiguration, type ChartOptions } from 'chart.js';
import { GITHUB_LANGUAGE_COLORS } from '../contants';

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

export const skillLevelChartConfig: ChartConfiguration = {
	type: 'radar',
	data: {
		labels: [],
		datasets: []
	},
	options: {
		responsive: true,
		maintainAspectRatio: false,
		...options,
		scales: {
			r: {
				grid: { color: '#374151' },
				angleLines: { color: '#374151' },
				pointLabels: {
					color: '#6B7280',
					font: {
						size: 12
					}
				},
				min: 0,
				max: 100,
				ticks: {
					stepSize: 20
				}
			}
		},
		plugins: {
			tooltip: {
				backgroundColor: 'rgba(0,0,0,0.8)',
				padding: 12,
				titleFont: {
					size: 12
				},
				callbacks: {
					title: (tooltipItems) => {
						return tooltipItems[0].label;
					},
					label: (context) => {
						const value = context.parsed.r;
						const skillName = context.dataset.label || '';
						return `${skillName}: ${value.toFixed(0)}%`;
					}
				}
			},
			legend: {
				position: 'top',
				align: 'center',
				labels: {
					padding: 12,
					boxWidth: 12,
					font: {
						size: 12
					}
				}
			}
		}
	}
};
