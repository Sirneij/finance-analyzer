<script lang="ts">
	import Adjust from '$lib/components/icons/Adjust.svelte';
	import Close from '$lib/components/icons/Close.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import TagFilter from '$lib/components/blog/list/TagFilter.svelte';
	import { debounce } from '$lib/utils/helpers/resume.helpers';
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { formatSearchResponse } from '$lib/utils/helpers/editor/blogs.helpers';

	let {
		searchInput = $bindable(),
		searchResponse = $bindable(),
		isFilterOpen = $bindable(),
		sortBy = $bindable(),
		dateRange = $bindable(),
		selectedTags = $bindable(),
		tags = $bindable(),
		isSearching = $bindable(),
		tagsMetadata
	} = $props();

	let searchForm = $state<HTMLFormElement>(),
		isInitialLoad = true,
		shouldPreventSubmit = true,
		searchQuery = $state('');

	// eslint-disable-next-line no-unused-vars
	const searchDebounce = debounce((query: string) => {
		searchForm?.requestSubmit();
		isSearching = false;
	}, 500);

	const filterDebounce = debounce(() => {
		searchForm?.requestSubmit();
	}, 100);

	// Filters effect
	$effect(() => {
		if (
			!shouldPreventSubmit &&
			(sortBy !== 'recent' || dateRange !== 'all' || selectedTags.length > 0)
		) {
			isSearching = true;
			filterDebounce();
		}
	});

	// Handle input event separately from form submission
	const handleSearchInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;
		isSearching = !!target.value;
		searchDebounce(target.value);
	};

	// URL params effect
	$effect(() => {
		if (isInitialLoad) {
			const params = page.url.searchParams;
			searchResponse = formatSearchResponse(params);
			if (params.has('q') && searchQuery) searchQuery = params.get('q') ?? '';
			if (params.has('sortBy')) sortBy = params.get('sortBy');
			if (params.has('period')) dateRange = params.get('period');
			if (params.has('tags[]')) selectedTags = params.getAll('tags[]');

			isInitialLoad = false;
			// Allow form submission after initial state is set
			setTimeout(() => {
				shouldPreventSubmit = false;
			}, 0);
		}
	});

	onDestroy(() => {
		searchDebounce.cancel();
		filterDebounce.cancel();
	});

	const restoreFocus = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				searchInput?.focus();
				// Position cursor at end
				const length = searchInput?.value.length || 0;
				searchInput?.setSelectionRange(length, length);
			});
		});
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		const wasSearchFocused = document.activeElement === searchInput;

		const currentTarget = e.currentTarget as HTMLFormElement;
		const formData = new FormData(searchForm);
		const params = new URLSearchParams(formData as any);
		// Update search response
		searchResponse = formatSearchResponse(params);

		await goto(`${currentTarget.action}?${params.toString()}`);

		if (wasSearchFocused) {
			restoreFocus();
		}
	};
</script>

<form
	class="relative mx-auto flex max-w-2xl gap-2"
	action="/blogs"
	bind:this={searchForm}
	onsubmit={handleSubmit}
>
	<!-- Search Input -->
	<div class="relative flex-1">
		<label for="search" class="sr-only">Search articles</label>
		<input
			bind:this={searchInput}
			id="search"
			type="search"
			name="q"
			placeholder="Search articles by title or content... (Press '/' to focus)"
			bind:value={searchQuery}
			oninput={handleSearchInput}
			class="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pl-12 text-base shadow-sm transition-all placeholder:text-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
		/>
		<Search class="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
		{#if searchQuery}
			<button
				type="button"
				class="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
				onclick={() => (searchQuery = '')}
			>
				<span class="sr-only">Clear search</span>
				<Close class="h-5 w-5" />
			</button>
		{/if}
	</div>

	<!-- Filter Button and Dropdown -->
	<div class="relative">
		<button
			type="button"
			class="flex h-[46px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
			onclick={() => (isFilterOpen = !isFilterOpen)}
			aria-expanded={isFilterOpen}
		>
			<Adjust class="h-5 w-5" />
			<span class="hidden sm:inline">Filter</span>
			{#if sortBy !== 'recent' || dateRange !== 'all' || selectedTags.length > 0}
				<span
					class="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white"
				>
					{(sortBy !== 'recent' ? 1 : 0) +
						(dateRange !== 'all' ? 1 : 0) +
						(selectedTags.length > 0 ? 1 : 0)}
				</span>
			{/if}
		</button>

		{#if isFilterOpen}
			<div
				class="animate-in fade-in-0 zoom-in-95 absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg transition-all dark:border-gray-700 dark:bg-gray-800"
				role="dialog"
				aria-label="Filter options"
			>
				<!-- Sort Options -->
				<div class="mb-4">
					<h3 class="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">Sort by</h3>
					<div class="flex gap-2">
						<button
							type="button"
							class="flex-1 rounded-md px-3 py-1.5 text-sm transition-colors
                       {sortBy === 'recent'
								? 'bg-blue-500 text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}"
							onclick={() => (sortBy = 'recent')}
						>
							Most Recent
						</button>
						<input type="hidden" name="sortBy" value={sortBy} />
						<button
							type="button"
							class="flex-1 rounded-md px-3 py-1.5 text-sm transition-colors
                       {sortBy === 'popular'
								? 'bg-blue-500 text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}"
							onclick={() => (sortBy = 'popular')}
						>
							Most Popular
						</button>
					</div>
				</div>

				<!-- Date Range -->
				<div class="mb-4">
					<h3 class="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">Time Period</h3>
					<select
						bind:value={dateRange}
						name="period"
						class="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
					>
						<option value="all">All Time</option>
						<option value="week">Past Week</option>
						<option value="month">Past Month</option>
						<option value="year">Past Year</option>
					</select>
				</div>

				<!-- Tag Filter -->
				<div class="mb-4">
					<TagFilter {tags} bind:selectedTags {tagsMetadata} />
				</div>

				<!-- Apply/Reset Buttons -->
				<div class="mt-4 flex gap-2 border-t pt-4 dark:border-gray-700">
					<button
						type="submit"
						class="flex-1 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
					>
						Apply Filters
					</button>
					<button
						class="rounded-md px-4 py-2 text-sm font-medium text-gray-700
                     transition-colors hover:bg-gray-100 focus:outline-none
                     focus:ring-2 focus:ring-gray-500/50 dark:text-gray-200
                     dark:hover:bg-gray-700"
						onclick={() => {
							sortBy = 'recent';
							dateRange = 'all';
							selectedTags = [];
							searchQuery = '';
						}}
					>
						Reset
					</button>
				</div>
			</div>
		{/if}
	</div>
</form>

{#if isSearching}
	<div
		class="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400"
		role="status"
	>
		<span>Searching</span>
		<div class="flex gap-1" aria-hidden="true">
			<span class="h-1 w-1 animate-[pulse_1.4s_ease-in-out_infinite] rounded-full bg-current"
			></span>
			<span class="h-1 w-1 animate-[pulse_1.4s_ease-in-out_infinite_200ms] rounded-full bg-current"
			></span>
			<span class="h-1 w-1 animate-[pulse_1.4s_ease-in-out_infinite_400ms] rounded-full bg-current"
			></span>
		</div>
	</div>
{/if}
