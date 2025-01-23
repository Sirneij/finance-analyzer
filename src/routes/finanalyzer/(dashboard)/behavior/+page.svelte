<script lang="ts">
	import { browser } from '$app/environment';
	import Anomaly from '$lib/components/behavior/Anomaly.svelte';
	import Insight from '$lib/components/behavior/Insight.svelte';
	import ManualAdd from '$lib/components/behavior/ManualAdd.svelte';
	import SpendingCategories from '$lib/components/behavior/SpendingCategories.svelte';
	import Empty from '$lib/components/reusables/Empty.svelte';
	import FormError from '$lib/components/reusables/FormError.svelte';
	import LoadingInsight from '$lib/components/reusables/LoadingInsight.svelte';
	import FileInput from '$lib/components/transactions/FileInput.svelte';
	import type { SpendingReport } from '$lib/types/transaction.types';
	import { getFinancialInsights } from '$lib/utils/helpers/transactions.helpers';
	import { onDestroy, onMount } from 'svelte';
	import type { ActionData } from './$types';
	import { NEEDEDDATA, WebSocketService } from '$lib/services/websocket';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import { BASE_WS_URI } from '$lib/utils/contants';
	import { page } from '$app/state';
	import type { ProgressSteps } from '$lib/types/notification.types';

	const { form }: { form: ActionData } = $props();

	let transAnalysis: SpendingReport = $state({} as SpendingReport),
		loadingAnalysis = $state(true),
		loadingAnalysisProgress: ProgressSteps[] = $state([]),
		webSocketService: WebSocketService;

	onMount(() => {
		if (browser) {
			webSocketService = new WebSocketService(`${BASE_WS_URI}`, page.data.user?._id || '', [
				NEEDEDDATA.ANALYSIS
			]);

			webSocketService.socket.onmessage = (event: MessageEvent) => {
				const data = JSON.parse(event.data);
				switch (data.action) {
					case 'progress':
						if (data.taskType === 'Analysis') {
							loadingAnalysisProgress.push({
								progress: data.progress,
								message: data.message
							});
						}
						break;
					case 'analysis_complete':
						transAnalysis = data.result;
						loadingAnalysis = false;
						break;
					default:
						break;
				}
			};
		}
	});

	onDestroy(() => {
		if (webSocketService) webSocketService.close();
	});
</script>

<AnimatedContainer class="space-y-6 p-6">
	<!-- Hero Section -->
	<AnimatedSection
		y={20}
		class="flex flex-col space-y-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6"
	>
		<div class="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
			<img
				src={page.data.user?.avatar}
				alt={page.data.user?.name}
				class="h-12 w-12 rounded-full ring-2 ring-indigo-500 sm:h-14 sm:w-14 md:h-16 md:w-16"
				loading="lazy"
			/>
			<div class="text-center sm:text-left">
				<h1 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl md:text-3xl">
					Financial Behavior
				</h1>
				<p class="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
					Analyze and understand your spending patterns
				</p>
			</div>
		</div>
	</AnimatedSection>
	<!-- Error Message -->
	<AnimatedSection y={20}>
		<FormError {form} />
	</AnimatedSection>

	<!-- Input Section -->
	<AnimatedSection y={30} delay={200}>
		<div class="grid gap-6 lg:grid-cols-2">
			<FileInput header="Upload Financial Data" />
			<ManualAdd />
		</div>
	</AnimatedSection>

	<!-- Charts Section -->
	<AnimatedSection y={40} delay={400}>
		<div class="grid gap-6 lg:grid-cols-2">
			<Anomaly
				anomalies={transAnalysis.anomalies}
				loading={loadingAnalysis}
				steps={loadingAnalysisProgress}
			/>
			<SpendingCategories
				categories={transAnalysis.categories}
				loading={loadingAnalysis}
				steps={loadingAnalysisProgress}
			/>
		</div>
	</AnimatedSection>

	<!-- Insights Section -->
	<AnimatedSection y={50} delay={600}>
		<div class="grid gap-6 sm:grid-cols-2">
			{#if loadingAnalysis}
				<LoadingInsight steps={loadingAnalysisProgress} numBoxes={1} minHeight="8rem" />
				<LoadingInsight steps={loadingAnalysisProgress} numBoxes={1} minHeight="8rem" />
			{:else if !transAnalysis.spending_trends}
				<div class="col-span-2 flex min-h-[200px] items-center justify-center">
					<Empty
						title="No insights available"
						description="No insights available for your account."
					/>
				</div>
			{:else}
				{#each getFinancialInsights(transAnalysis) as insight}
					<Insight {insight} />
				{/each}
			{/if}
		</div>
	</AnimatedSection>
</AnimatedContainer>
