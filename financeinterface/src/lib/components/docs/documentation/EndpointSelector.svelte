<script lang="ts">
	import MethodBadge from '$lib/components/docs/MethodBadge.svelte';
	import Caret from '$lib/components/icons/Caret.svelte';
	import type { Endpoint } from '$lib/types/docs.types';
	import { slide } from 'svelte/transition';

	let {
		endpoints,
		selectedEndpoint = $bindable(),
		formState = $bindable()
	}: {
		endpoints: Endpoint[];
		selectedEndpoint: Endpoint | null;
		formState: any;
	} = $props();

	let isOpen = $state(false);

	function handleEndpointSelect(endpoint: Endpoint) {
		selectedEndpoint = endpoint;
		isOpen = false;

		// Populate form with endpoint data
		formState.path = endpoint.path;
		formState.method = endpoint.method;
		formState.middlewares = [...endpoint.middlewares];
	}
</script>

<div class="relative mb-8">
	<button
		onclick={() => (isOpen = !isOpen)}
		class="flex w-full items-center justify-between bg-white px-4 py-3 text-left hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600"
	>
		<span class="text-gray-700 dark:text-gray-200">
			{selectedEndpoint?.path || 'Select an endpoint'}
		</span>
		<Caret trend={isOpen ? 'up' : 'down'} class="h-5 w-5 transition-transform dark:text-white" />
	</button>

	{#if isOpen}
		<div transition:slide class="absolute z-10 mt-2 w-full bg-white shadow-lg dark:bg-gray-700">
			{#each endpoints as endpoint}
				<button
					onclick={() => handleEndpointSelect(endpoint)}
					class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
				>
					<MethodBadge method={endpoint.method} />
					<span class="ml-2 text-gray-800 dark:text-gray-200">{endpoint.path}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
