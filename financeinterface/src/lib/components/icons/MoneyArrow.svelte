<script lang="ts">
	let { txType, ...props }: { txType: 'income' | 'expense' } = $props();
</script>

<svg
	class={`h-5 w-5 ${
		txType === 'income'
			? 'text-green-600 dark:text-green-400'
			: txType === 'expense'
				? 'text-red-600 dark:text-red-400'
				: 'text-indigo-600 dark:text-indigo-400'
	}`}
	fill="none"
	viewBox="0 0 24 24"
	stroke="currentColor"
	{...props}
>
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="2"
		d={txType === 'income'
			? 'M5 10l7-7m0 0l7 7m-7-7v18'
			: txType === 'expense'
				? 'M19 14l-7 7m0 0l-7-7m7 7V3'
				: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'}
	/>
</svg>
