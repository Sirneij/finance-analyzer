<script lang="ts">
	import type { ApiDoc } from '$lib/types/docs.types';
	import Logo from '$lib/components/logos/Logo.svelte';
	import { page } from '$app/state';

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

	const categories = $derived([...new Set(docs.map((doc: ApiDoc) => doc.category))]);

	const methodColors = {
		GET: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
		POST: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800',
		PUT: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
		DELETE:
			'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
		PATCH:
			'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800'
	};
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
				<div class="mb-6">
					<h3
						class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
					>
						{category}
					</h3>
					<ul class="space-y-1">
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
									<span
										class="inline-flex w-16 items-center justify-center rounded border px-2 py-0.5 text-xs font-medium uppercase {methodColors[
											doc.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
										]}"
									>
										{doc.method}
									</span>
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
							<span
								class="inline-flex w-12 items-center justify-center rounded border px-2 py-0.5 text-xs font-medium uppercase {methodColors[
									doc.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
								]}"
							>
								{doc.method}
							</span>
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
