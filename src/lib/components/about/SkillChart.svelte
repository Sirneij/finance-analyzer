<script lang="ts">
	import { browser } from '$app/environment';
	import { skillLevelChartConfig, updateChartTheme } from '$lib/utils/helpers/charts.helpers';
	import { SKILLS } from '$lib/utils/contants';

	let chartElement = $state<HTMLDivElement>(),
		chart: ApexCharts | null = null;

	async function initChart() {
		if (!browser) return;

		try {
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

			if (chart) {
				chart.destroy();
			}

			if (chartElement) {
				chart = new ApexCharts(chartElement, options);
				await chart.render();

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
					chart?.destroy();
				};
			}
		} catch (error) {
			console.error('Chart initialization error:', error);
		}
	}

	$effect(() => {
		if (browser && SKILLS.length) {
			initChart();
		}
	});
</script>

<div class="relative aspect-square h-full w-full">
	<div bind:this={chartElement} class="h-full w-full"></div>
</div>
