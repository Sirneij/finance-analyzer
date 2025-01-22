<script lang="ts">
	import Search from '$lib/components/icons/Search.svelte';
	import type { ApiDoc } from '$lib/types/docs.types';
	import { slide } from 'svelte/transition';
	import Endpoints from './documentation/Endpoints.svelte';
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import { debounce } from '$lib/utils/helpers/resume.helpers';

	let { docs }: { docs: ApiDoc[] } = $props();

	let selectedIndex = $state(-1);
	let searchResults = $state<ApiDoc[]>([]);
	let searchQuery = $state('');
	let isLoading = $state(false);

	const debouncedSearch = debounce(() => {
		searchResults = docs.filter((doc: ApiDoc) => {
			if (!searchQuery) return false;
			const searchTerm = searchQuery.toLowerCase();
			const combined = `${doc.path}${doc.method}${doc.description}`.toLowerCase();
			return combined.includes(searchTerm);
		});

		isLoading = false;
	}, 300);

	function handleKeydown(event: KeyboardEvent) {
		if (!searchQuery) return;

		switch (event.key) {
			case 'ArrowDown':
				selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1);
				break;
			case 'ArrowUp':
				selectedIndex = Math.max(selectedIndex - 1, -1);
				break;
			case 'Enter':
				if (selectedIndex >= 0) {
					// Handle selection
				}
				break;
			case 'Escape':
				searchQuery = '';
				break;
		}
	}

	function clearSearch() {
		searchQuery = '';
		selectedIndex = -1;
	}
</script>

<div class="fixed right-20 top-4 z-50 xs:left-16 xs:right-auto">
	<div class="relative">
		<input
			type="search"
			aria-label="Search documentation"
			bind:value={searchQuery}
			oninput={() => {
				isLoading = true;
				debouncedSearch();
			}}
			onkeydown={handleKeydown}
			placeholder="Search docs..."
			class="w-48 rounded-full bg-white px-4 py-2 pr-12 text-sm shadow-sm outline-none transition-all duration-300 ease-in-out placeholder:text-gray-400 hover:shadow-md dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 xs:focus:w-48 sw:focus:w-[26rem]"
		/>

		{#if searchQuery}
			<button
				type="button"
				aria-label="Clear search"
				class="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600
                       dark:text-gray-500 dark:hover:text-gray-300"
				onclick={clearSearch}
			>
				<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
					<path d="M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z" />
				</svg>
			</button>
		{/if}

		<Search class="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />

		{#if searchQuery.length >= 2}
			<div
				role="listbox"
				class="absolute z-10 w-full rounded-lg bg-white shadow-md dark:bg-gray-800"
				transition:slide={{ duration: SLIDE_DURATION }}
			>
				{#if isLoading}
					<p class="p-2 text-sm text-gray-500 dark:text-gray-400">Searching...</p>
				{:else if searchResults.length === 0}
					<p class="p-2 text-sm text-gray-500 dark:text-gray-400">No results found</p>
				{:else}
					<Endpoints endpoints={searchResults} isOpen={true} handleEndpointSelect={null} />
				{/if}
			</div>
		{/if}
	</div>
</div>
