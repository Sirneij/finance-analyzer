<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { skillLevelChartConfig, updateChartTheme } from '$lib/utils/helpers/charts.helpers';
	import { SKILLS } from '$lib/utils/contants';

	let chartElement = $state<HTMLDivElement>(),
		chart: ApexCharts | null = null;

	async function initChart() {
		if (!browser || !chartElement) return;

		const { default: ApexCharts } = await import('apexcharts');

		const options = {
			...skillLevelChartConfig,
			series: [
				{
					name: 'Skills',
					data: SKILLS.map((s) => s.level)
				}
			],
			xaxis: {
				categories: SKILLS.map((s) => s.name),
				labels: {
					style: {
						colors: 'rgba(156, 163, 175, 0.9)'
					}
				}
			}
		};

		// Cleanup previous instance
		if (chart) {
			chart.destroy();
		}

		chart = new ApexCharts(chartElement, options);
		chart.render();

		// Handle dark mode changes
		const observer = new MutationObserver(() => {
			const isDark = document.documentElement.classList.contains('dark');
			chart?.updateOptions(updateChartTheme(isDark));
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		return () => {
			observer.disconnect();
			if (chart) {
				chart.destroy();
			}
		};
	}

	$effect(() => {
		if (browser && chartElement) {
			initChart();
		}
	});
</script>

<div class="relative aspect-square h-full w-full">
	<div bind:this={chartElement}></div>
</div>
