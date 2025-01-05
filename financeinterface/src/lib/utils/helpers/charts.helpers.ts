import type { ChartConfiguration } from 'chart.js';

export const financialChartConfig: ChartConfiguration = {
	type: 'line',
	data: {
		labels: [],
		datasets: []
	},
	options: {
		responsive: true,
		maintainAspectRatio: false,
		animation: {
			duration: 2000, // Animation duration in milliseconds
			easing: 'easeInOutElastic', // Animation easing function
			delay: (context) => context.dataIndex * 100 // Stagger animation
			// loop: true
		}
	}
};
