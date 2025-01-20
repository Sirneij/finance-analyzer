<script lang="ts">
	import type { InsightMetric } from '$lib/types/transaction.types';

	let { insight }: { insight: InsightMetric } = $props();
</script>

<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-medium text-gray-900 dark:text-white">{insight.title}</h3>
		<span
			class={`text-lg font-bold ${
				insight.trend === 'positive'
					? 'text-green-500'
					: insight.trend === 'negative'
						? 'text-red-500'
						: 'text-gray-500'
			}`}
		>
			{insight.value}%
		</span>
	</div>
	<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
</div>
