<script lang="ts">
	import Chart from 'chart.js/auto';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import type { GithubUserDetails } from '$lib/types/github.types';
	import {
		getLanguageColor,
		languageUsageChartConfig,
		skillLevelChartConfig
	} from '$lib/utils/helpers/charts.helpers';

	let {
		skills,
		githubData
	}: { skills: { name: string; level: number }[]; githubData: GithubUserDetails } = $props();

	let radarChart: Chart | null = null,
		pieChart: Chart | null = null,
		radarCanvas = $state<HTMLCanvasElement>(),
		chartInitialized = false,
		pieCanvas = $state<HTMLCanvasElement>();

	$effect(() => {
		if (!radarCanvas || !pieCanvas || chartInitialized) return;

		const skillsCtx = radarCanvas.getContext('2d');
		const languagesCtx = pieCanvas.getContext('2d');
		if (!skillsCtx || !languagesCtx) return;

		if (radarChart) {
			radarChart.destroy();
		}
		if (pieChart) {
			pieChart.destroy();
		}

		skillLevelChartConfig.data = {
			labels: skills.map((s) => s.name),
			datasets: [
				{
					label: 'Skills',
					data: skills.map((s) => s.level),
					backgroundColor: 'rgba(99, 102, 241, 0.2)',
					borderColor: 'rgba(99, 102, 241, 1)',
					borderWidth: 2
				}
			]
		};

		languageUsageChartConfig.data = {
			labels: githubData.languages.map((l) => l.name),
			datasets: [
				{
					data: githubData.languages.map((l) => l.bytes),
					backgroundColor: githubData.languages.map((l) => getLanguageColor(l.name))
				}
			]
		};

		radarChart = new Chart(skillsCtx, skillLevelChartConfig);
		pieChart = new Chart(languagesCtx, languageUsageChartConfig);
		chartInitialized = true;

		return () => {
			if (radarChart && pieChart) {
				radarChart.destroy();
				pieChart.destroy();
				chartInitialized = false;
			}
		};
	});
</script>

<AnimatedSection class="grid grid-cols-1 gap-8 sm:gap-4 md:grid-cols-2 md:gap-8" y={50} delay={200}>
	<div class="h-full min-h-[300px] rounded-xl bg-gray-100 p-4 sm:p-6 dark:bg-gray-800/50">
		<div class="relative aspect-square h-full w-full">
			<canvas bind:this={radarCanvas}></canvas>
		</div>
	</div>

	<div class="h-full min-h-[300px] rounded-xl bg-gray-100 p-4 sm:p-6 dark:bg-gray-800/50">
		<div class="relative aspect-square h-full w-full">
			<canvas bind:this={pieCanvas}></canvas>
		</div>
	</div>
</AnimatedSection>
