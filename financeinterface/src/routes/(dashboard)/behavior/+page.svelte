<script lang="ts">
	import { browser } from '$app/environment';
	import Anomaly from '$lib/components/behavior/Anomaly.svelte';
	import Insight from '$lib/components/behavior/Insight.svelte';
	import ManualAdd from '$lib/components/behavior/ManualAdd.svelte';
	import SpendingCategories from '$lib/components/behavior/SpendingCategories.svelte';
	import Empty from '$lib/components/resuables/Empty.svelte';
	import FormError from '$lib/components/resuables/FormError.svelte';
	import LoadingInsight from '$lib/components/resuables/LoadingInsight.svelte';
	import FileInput from '$lib/components/transactions/FileInput.svelte';
	import type { SpendingReport } from '$lib/types/transaction.types';
	import { getFinancialInsights } from '$lib/utils/helpers/transactions.helpers';
	import { onDestroy, onMount } from 'svelte';
	import type { ActionData } from './$types';
	import { NEEDEDDATA, WebSocketService } from '$lib/services/websocket';
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

<div class="space-y-6 p-6">
	<FormError {form} />
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- File Upload -->
		<FileInput />

		<!-- Manual Input Form -->
		<ManualAdd />
	</div>

	<!-- Charts Section -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Suspicious transactions -->
		<Anomaly
			anomalies={transAnalysis.anomalies}
			loading={loadingAnalysis}
			steps={loadingAnalysisProgress}
		/>

		<!-- Spending Categories -->
		<SpendingCategories
			categories={transAnalysis.categories}
			loading={loadingAnalysis}
			steps={loadingAnalysisProgress}
		/>
	</div>

	<!-- Insights Section -->
	<div class="grid gap-6 sm:grid-cols-2">
		<!-- Saving rate -->
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
</div>
