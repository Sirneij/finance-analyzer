<script lang="ts">
	import ChartBar from '$lib/components/icons/ChartBar.svelte';
	let { title, description }: { title: string; description: string } = $props();
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800"
>
	<ChartBar class="mb-2 h-6 w-6 text-gray-400 dark:text-gray-500" />
	<p class="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
	<p class="text-center text-xs text-gray-500 dark:text-gray-500">
		{description}
	</p>
</div>
