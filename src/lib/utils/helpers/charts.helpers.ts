import { type ChartConfiguration, type ChartOptions } from 'chart.js';
import {
	Chart,
	LineController,
	LineElement,
	BarController,
	BarElement,
	RadarController,
	RadialLinearScale,
	CategoryScale,
	LinearScale,
	PointElement,
	Tooltip,
	Legend
} from 'chart.js';

// Register only required components
Chart.register(
	LineController,
	LineElement,
	BarController,
	BarElement,
	RadarController,
	RadialLinearScale,
	CategoryScale,
	LinearScale,
	PointElement,
	Tooltip,
	Legend
);

// Base configuration for all charts
const baseOptions: ChartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	animation: {
		duration: 1000, // Reduced from 2000
		easing: 'easeInOutQuart'
	},
	plugins: {
		legend: {
			display: false
		},
		tooltip: {
			backgroundColor: 'rgba(0,0,0,0.8)',
			padding: 12,
			titleFont: { size: 12 }
		}
	}
};

// Reusable currency formatter
const formatCurrency = (value: number): string => `$${value.toLocaleString()}`;

// Memoized color generator
const colorCache = new Map<number, { backgroundColors: string[]; borderColors: string[] }>();
export const generateChartColors = (count: number) => {
	if (colorCache.has(count)) {
		return colorCache.get(count)!;
	}

	const colors = {
		backgroundColors: Array.from(
			{ length: count },
			(_, i) => `hsla(${(i * 360) / count}, 70%, 60%, 0.7)`
		),
		borderColors: Array.from({ length: count }, (_, i) => `hsla(${(i * 360) / count}, 70%, 60%, 1)`)
	};

	colorCache.set(count, colors);
	return colors;
};

// Financial and Monthly charts config
const financialOptions: ChartOptions = {
	...baseOptions,
	scales: {
		y: {
			beginAtZero: true,
			ticks: {
				callback: (_: any, value: number) => formatCurrency(value)
			}
		},
		x: {
			grid: { display: false }
		}
	},
	plugins: {
		...baseOptions.plugins,
		tooltip: {
			callbacks: {
				label: (context) => {
					const label = context.dataset.label;
					return `${label ? `${label}: ` : ''}${formatCurrency(context.parsed.y)}`;
				}
			}
		}
	}
};

// Radar chart specific options
const radarOptions: ChartOptions = {
	...baseOptions,
	scales: {
		r: {
			grid: { color: '#374151' },
			angleLines: { color: '#374151' },
			pointLabels: {
				color: '#6B7280',
				font: { size: 12 }
			},
			min: 0,
			max: 100,
			ticks: { stepSize: 20 }
		}
	},
	plugins: {
		...baseOptions.plugins,
		legend: {
			display: true,
			position: 'top',
			align: 'center',
			labels: {
				padding: 12,
				boxWidth: 12,
				font: { size: 12 }
			}
		},
		tooltip: {
			callbacks: {
				label: (context) => {
					const value = context.parsed.r;
					const skillName = context.dataset.label || '';
					return `${skillName}: ${value.toFixed(0)}%`;
				}
			}
		}
	}
};

// Export configurations
export const financialChartConfig: ChartConfiguration = {
	type: 'line',
	data: { labels: [], datasets: [] },
	options: financialOptions
};

export const spendingCategoriesChartConfig: ChartConfiguration = {
	type: 'bar',
	data: { labels: [], datasets: [] },
	options: financialOptions
};

export const monthlySummariesChartConfig: ChartConfiguration = {
	type: 'line',
	data: { labels: [], datasets: [] },
	options: financialOptions
};

export const skillLevelChartConfig: ChartConfiguration = {
	type: 'radar',
	data: { labels: [], datasets: [] },
	options: radarOptions
};
