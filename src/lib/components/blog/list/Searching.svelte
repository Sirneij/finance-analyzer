<script lang="ts">
	import Adjust from '$lib/components/icons/Adjust.svelte';
	import Close from '$lib/components/icons/Close.svelte';
	import Search from '$lib/components/icons/Search.svelte';

	let {
		searchInput = $bindable(),
		searchQuery = $bindable(),
		isFilterOpen = $bindable(),
		sortBy = $bindable(),
		dateRange = $bindable()
	} = $props();
</script>

<div class="relative mx-auto flex max-w-2xl gap-2">
	<!-- Search Input -->
	<div class="relative flex-1">
		<label for="search" class="sr-only">Search articles</label>
		<input
			bind:this={searchInput}
			id="search"
			type="search"
			placeholder="Search articles by title or tags... (Press '/' to focus)"
			bind:value={searchQuery}
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
			{#if sortBy !== 'recent' || dateRange !== 'all'}
				<span
					class="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white"
				>
					{(sortBy !== 'recent' ? 1 : 0) + (dateRange !== 'all' ? 1 : 0)}
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
							class="flex-1 rounded-md px-3 py-1.5 text-sm transition-colors
                       {sortBy === 'recent'
								? 'bg-blue-500 text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}"
							onclick={() => (sortBy = 'recent')}
						>
							Most Recent
						</button>
						<button
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
						class="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
					>
						<option value="all">All Time</option>
						<option value="week">Past Week</option>
						<option value="month">Past Month</option>
						<option value="year">Past Year</option>
					</select>
				</div>

				<!-- Apply/Reset Buttons -->
				<div class="mt-4 flex gap-2 border-t pt-4 dark:border-gray-700">
					<button
						class="flex-1 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
						onclick={() => (isFilterOpen = false)}
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
						}}
					>
						Reset
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
