<script lang="ts">
	import type { ApiDoc } from '$lib/types/docs.types';
	import Logo from '$lib/components/logos/Logo.svelte';
	import { page } from '$app/state';
	import MethodBadge from './MethodBadge.svelte';
	import Caret from '../icons/Caret.svelte';
	import { slide } from 'svelte/transition';

	let {
		docs,
		activeDoc,
		className,
		isCollapsed = $bindable()
	} = $props<{
		docs: ApiDoc[];
		activeDoc: string;
		className: string;
		isCollapsed: boolean;
	}>();

	const categories = $derived([...new Set<string>(docs.map((doc: ApiDoc) => doc.category))]);

	// Change to simple object
	let expandedCategories = $state<Record<string, boolean>>({});

	// Update effect to use object
	$effect(() => {
		expandedCategories = categories.reduce(
			(acc, category) => {
				acc[category] = true;
				return acc;
			},
			{} as Record<string, boolean>
		);
	});

	function toggleCategory(category: string) {
		expandedCategories[category] = !expandedCategories[category];
	}
</script>

<aside class="{className} {isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300">
	<div
		class="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700"
	>
		<a href="/" class="flex items-center">
			<Logo class="h-8 w-auto" isSmall={isCollapsed} />
		</a>
		<button
			onclick={() => (isCollapsed = !isCollapsed)}
			class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
			aria-label="Toggle sidebar"
		>
			<svg class="h-6 w-6 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none">
				<path
					stroke="currentColor"
					stroke-width="2"
					d={isCollapsed ? 'M9 19l7-7-7-7' : 'M15 19l-7-7 7-7'}
				/>
			</svg>
		</button>
	</div>

	<nav class="p-4">
		{#if !isCollapsed}
			{#each categories as category}
				<div class="mb-6" id={category}>
					<button
						onclick={() => toggleCategory(category)}
						class="mb-3 flex w-full items-center justify-between"
					>
						<h3
							class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
						>
							{category}
						</h3>
						<Caret
							class="h-4 w-4 transform text-gray-500 transition-transform duration-300 dark:text-gray-400"
							style={expandedCategories[category] ? '' : 'transform: rotate(-90deg)'}
							trend="down"
						/>
					</button>
					{#if expandedCategories[category]}
						<ul class="space-y-1" transition:slide>
							{#each docs.filter((doc: ApiDoc) => doc.category === category) as doc}
								<li
									class={page.url.pathname === `/finanalyzer/docs/${doc._id}`
										? 'bg-gray-50 dark:bg-gray-800/50'
										: ''}
								>
									<a
										href={`/finanalyzer/docs/${doc._id}`}
										class="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50"
										title={doc.path}
									>
										<MethodBadge method={doc.method} />
										<div class="min-w-0 flex-1">
											<span
												class="block truncate {activeDoc === doc._id
													? 'font-medium text-indigo-600 dark:text-indigo-400'
													: 'text-gray-700 dark:text-gray-300'}"
											>
												{doc.path}
											</span>
										</div>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		{:else}
			<ul class="space-y-1">
				{#each docs as doc}
					<li>
						<a
							href={`/finanalyzer/docs/${doc._id}`}
							class="flex justify-center rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
							title={doc.path}
						>
							<MethodBadge method={doc.method} />
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</nav>
</aside>

<style>
	nav {
		height: calc(100vh - 4rem);
		overflow-y: auto;
	}
</style>
