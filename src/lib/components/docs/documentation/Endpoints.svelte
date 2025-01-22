<script lang="ts">
	import { slide } from 'svelte/transition';
	import MethodBadge from '../MethodBadge.svelte';
	import type { ApiDoc, Endpoint } from '$lib/types/docs.types';
	import type { HTMLAttributes } from 'svelte/elements';

	interface EndpointsProps extends HTMLAttributes<HTMLElement> {
		isOpen: boolean;
		endpoints: Endpoint[] | ApiDoc[];
		handleEndpointSelect: ((endpoint: Endpoint) => void) | null;
		selectedIndex?: number;
	}

	let {
		isOpen,
		endpoints,
		handleEndpointSelect,
		selectedIndex = -1,
		...props
	}: EndpointsProps = $props();
</script>

{#if isOpen}
	<div
		transition:slide
		class="absolute z-10 mt-2 w-full bg-white shadow-lg dark:bg-gray-700"
		{...props}
	>
		{#each endpoints as endpoint, index}
			{#if handleEndpointSelect}
				<button
					onclick={() => handleEndpointSelect(endpoint as Endpoint)}
					class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 {selectedIndex ===
					index
						? 'bg-gray-100 dark:bg-gray-700'
						: ''}"
				>
					<MethodBadge method={(endpoint as Endpoint).method} />
					<span class="ml-2 text-gray-800 dark:text-gray-200">{endpoint.path}</span>
				</button>
			{:else}
				<a
					href="/finanalyzer/docs/{(endpoint as ApiDoc)._id}"
					class="block w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 {selectedIndex ===
					index
						? 'bg-gray-100 dark:bg-gray-700'
						: ''}"
				>
					<MethodBadge method={(endpoint as ApiDoc).method} />
					<span class="ml-2 text-gray-800 dark:text-gray-200">{(endpoint as ApiDoc).path}</span>
				</a>
			{/if}
		{/each}
	</div>
{/if}
