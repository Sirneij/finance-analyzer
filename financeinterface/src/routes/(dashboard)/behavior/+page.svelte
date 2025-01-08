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
	import {
		getFinancialInsights,
		getTransactionAnalysis
	} from '$lib/utils/helpers/transactions.helpers';
	import { onMount } from 'svelte';
	import type { ActionData } from './$types';
	import { addNotification } from '$lib/states/notification';

	const { form }: { form: ActionData } = $props();

	let transAnalysis: SpendingReport = $state({} as SpendingReport),
		loading = $state(true);

	$effect(() => {
		if (!browser) return;
		const fetchAnalysis = async () => {
			try {
				loading = true;
				transAnalysis = await getTransactionAnalysis();
			} catch (e) {
				console.error(e);
			} finally {
				if (transAnalysis.spending_trends) {
					addNotification('Financial insights loaded successfully', 'success');
				} else {
					addNotification('No insights available', 'info');
				}
				loading = false;
			}
		};

		onMount(async () => await fetchAnalysis());
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
		<Anomaly anomalies={transAnalysis.anomalies} {loading} />

		<!-- Spending Categories -->
		<SpendingCategories categories={transAnalysis.categories} {loading} />
	</div>

	<!-- Insights Section -->
	<div class="grid gap-6 sm:grid-cols-2">
		<!-- Saving rate -->
		{#if loading}
			{#each new Array(2) as _, i}
				<LoadingInsight />
			{/each}
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
