import type { ApexOptions } from 'apexcharts';

// Base configuration for all charts
const baseOptions: ApexOptions = {
	chart: {
		type: 'line',
		height: '100%',
		toolbar: {
			show: true,
			tools: {
				download: true,
				selection: true,
				zoom: true,
				zoomin: true,
				zoomout: true,
				pan: true,
				reset: true
			},
			autoSelected: 'zoom'
		},
		fontFamily: 'inherit',
		background: 'transparent'
	},
	stroke: {
		width: 2,
		curve: 'smooth'
	},
	grid: {
		borderColor: 'rgba(156, 163, 175, 0.1)',
		strokeDashArray: 4,
		yaxis: { lines: { show: true } },
		xaxis: { lines: { show: false } }
	},
	dataLabels: { enabled: false },
	tooltip: {
		theme: 'dark',
		y: {
			formatter: (value: number) => formatCurrency(value)
		}
	},
	legend: {
		show: false
	}
};

// Reusable currency formatter
const formatCurrency = (value: number): string => {
	// Use the user's locale
	const locale = navigator?.language || 'en-US';
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
};

// Financial chart configuration
export const financialChartConfig: ApexOptions = {
	...baseOptions,
	chart: {
		...baseOptions.chart,
		type: 'area'
	},
	colors: ['#22c55e', '#ef4444', '#3b82f6'],
	fill: {
		type: 'gradient',
		gradient: {
			shadeIntensity: 1,
			inverseColors: false,
			opacityFrom: 0.5,
			opacityTo: 0,
			stops: [0, 90, 100]
		}
	},
	yaxis: {
		labels: {
			formatter: (value) => formatCurrency(value),
			style: {
				colors: 'rgba(156, 163, 175, 0.9)'
			}
		}
	}
};

// Spending categories chart configuration
export const spendingCategoriesChartConfig: ApexOptions = {
	...baseOptions,
	chart: {
		...baseOptions.chart,
		type: 'pie'
	},
	plotOptions: {
		pie: {
			donut: {
				size: '65%'
			}
		}
	},
	legend: {
		show: true,
		position: 'right',
		fontSize: '14px',
		labels: {
			colors: 'rgba(156, 163, 175, 0.9)'
		}
	},
	dataLabels: {
		enabled: true,
		formatter: function (val: number, opts) {
			return val.toFixed(2) + '%';
		}
	},
	responsive: [
		{
			breakpoint: 480,
			options: {
				chart: {
					width: '100%'
				},
				legend: {
					position: 'bottom'
				}
			}
		}
	]
};

// Monthly summaries chart configuration
export const monthlySummariesChartConfig: ApexOptions = {
	...baseOptions,
	chart: {
		...baseOptions.chart,
		type: 'area'
	},
	colors: ['#22c55e', '#ef4444', '#3b82f6'],
	fill: {
		type: 'gradient',
		gradient: {
			shadeIntensity: 1,
			inverseColors: false,
			opacityFrom: 0.5,
			opacityTo: 0,
			stops: [0, 90, 100]
		}
	},
	yaxis: {
		labels: {
			formatter: (value) => formatCurrency(value),
			style: {
				colors: 'rgba(156, 163, 175, 0.9)'
			}
		}
	}
};

// Skill level chart configuration (Radar)
export const skillLevelChartConfig: ApexOptions = {
	chart: {
		type: 'radar',
		height: '100%',
		toolbar: { show: false },
		background: 'transparent'
	},
	stroke: {
		width: 2,
		curve: 'smooth'
	},
	fill: {
		opacity: 0.5
	},
	markers: {
		size: 5,
		hover: {
			size: 10
		}
	},
	yaxis: {
		show: false,
		min: 0,
		max: 100
	},
	plotOptions: {
		radar: {
			polygons: {
				strokeColors: 'rgba(156, 163, 175, 0.1)',
				connectorColors: 'rgba(156, 163, 175, 0.1)'
			}
		}
	},
	colors: ['rgba(99, 102, 241, 1)'],
	dataLabels: {
		enabled: false
	},
	tooltip: {
		enabled: true,
		theme: 'dark',
		y: {
			formatter: (value) => `${value}%`
		}
	}
};

// Helper function to update chart theme based on dark mode
export function updateChartTheme(isDark: boolean): Partial<ApexOptions> {
	return {
		tooltip: { theme: isDark ? 'dark' : 'light' },
		theme: {
			mode: isDark ? 'dark' : 'light'
		},
		grid: {
			borderColor: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.2)'
		}
	};
}

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
