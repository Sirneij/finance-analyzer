<script lang="ts">
	import Chart from 'chart.js/auto';
	import { skillLevelChartConfig } from '$lib/utils/helpers/charts.helpers';
	import { SKILLS } from '$lib/utils/contants';

	let radarChart: Chart | null = null,
		radarCanvas = $state<HTMLCanvasElement>(),
		chartInitialized = false;

	$effect(() => {
		if (!radarCanvas || chartInitialized) return;

		const skillsCtx = radarCanvas.getContext('2d');
		if (!skillsCtx) return;

		if (radarChart) {
			radarChart.destroy();
		}

		skillLevelChartConfig.data = {
			labels: SKILLS.map((s) => s.name),
			datasets: [
				{
					label: 'Skills',
					data: SKILLS.map((s) => s.level),
					backgroundColor: 'rgba(99, 102, 241, 0.2)',
					borderColor: 'rgba(99, 102, 241, 1)',
					borderWidth: 2
				}
			]
		};

		radarChart = new Chart(skillsCtx, skillLevelChartConfig);
		chartInitialized = true;

		return () => {
			if (radarChart) {
				radarChart.destroy();
				chartInitialized = false;
			}
		};
	});
</script>

<div class="relative aspect-square h-full w-full">
	<canvas bind:this={radarCanvas}></canvas>
</div>
