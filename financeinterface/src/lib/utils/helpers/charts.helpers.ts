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
					size: 14
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
				position: 'right',
				align: 'start',
				labels: {
					padding: 20,
					boxWidth: 15,
					font: {
						size: 12
					}
				}
			}
		}
	}
};

export const languageUsageChartConfig: ChartConfiguration = {
	type: 'pie',
	data: {
		labels: [],
		datasets: []
	},
	options: {
		...options,
		plugins: {
			legend: {
				display: true,
				position: 'right',

				labels: {
					boxWidth: 15,
					padding: 15,
					font: {
						size: 12
					}
				}
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const value = Number(context.raw);
						const total = context.dataset.data.reduce((acc, curr) => {
							// Handle different possible data types
							const currentValue =
								typeof curr === 'number'
									? curr
									: Array.isArray(curr)
										? curr[0]
										: typeof curr === 'object' && curr !== null
											? ((curr as any).value ?? 0)
											: 0;
							return acc + currentValue;
						}, 0);
						const percentage = ((value / (total as number)) * 100).toFixed(1);
						return `${context.label}: ${percentage}%`;
					}
				}
			}
		},
		scales: {
			r: {
				grid: { color: '#374151' },
				angleLines: { color: '#374151' },
				pointLabels: { color: '#6B7280' }
			}
		},
		layout: {
			padding: {
				left: 10,
				right: 10,
				top: 0,
				bottom: 0
			}
		}
	}
};
export const getLanguageColor = (language: string, opacity = 0.8) => {
	const hex =
		GITHUB_LANGUAGE_COLORS[language.toLocaleLowerCase() as keyof typeof GITHUB_LANGUAGE_COLORS] ||
		'#858585';
	// Convert hex to rgba
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
