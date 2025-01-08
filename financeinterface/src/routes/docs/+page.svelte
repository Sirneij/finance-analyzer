<script lang="ts">
	import { onMount } from 'svelte';
	import type { Endpoint, SupportedLanguage } from '$lib/types/docs.types';
	import { getMethodColor, groupEndpointsByCategory } from '$lib/utils/helpers/docs.helpers';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';

	let endpoints: Endpoint[] = [];
	let selectedLanguage: SupportedLanguage = 'nodejs';
	let searchQuery = '';

	onMount(async () => {
		const response = await fetch('/api/docs/endpoints');
		endpoints = await response.json();
	});
</script>

<div class="flex min-h-screen dark:bg-gray-900">
	<!-- Left Sidebar -->
	<aside class="w-64 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
		<div class="sticky top-0 bg-white p-4 dark:bg-gray-900">
			<input
				type="search"
				placeholder="Search APIs..."
				bind:value={searchQuery}
				class="w-full rounded-lg border px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
			/>
		</div>

		<nav class="p-4">
			{#each Object.entries(groupEndpointsByCategory(endpoints)) as [category, categoryEndpoints]}
				<div class="mb-6">
					<h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500">
						{category}
					</h3>
					<ul class="mt-2 space-y-1">
						{#each categoryEndpoints as endpoint}
							<li>
								<a
									href="#{endpoint.path}"
									class="block rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
								>
									<span class="text-sm font-medium">{endpoint.path}</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</nav>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto">
		<div class="mx-auto max-w-3xl px-4 py-8">
			<div class="sticky top-0 z-10 bg-white py-4 dark:bg-gray-900">
				<div class="flex space-x-2">
					{#each ['nodejs', 'python', 'go', 'rust'] as lang}
						<button
							class="rounded-lg px-4 py-2 text-sm font-medium
                       {selectedLanguage === lang
								? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
								: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}"
							on:click={() => (selectedLanguage = lang as SupportedLanguage)}
						>
							{lang}
						</button>
					{/each}
				</div>
			</div>

			{#each endpoints as endpoint}
				<section id={endpoint.path} class="mb-16">
					<div class="flex items-center space-x-3">
						<span
							class="rounded px-2 py-1 text-xs font-medium
                         {getMethodColor(endpoint.method)}"
						>
							{endpoint.method}
						</span>
						<h2 class="text-xl font-bold">{endpoint.path}</h2>
					</div>

					<p class="mt-4 text-gray-600 dark:text-gray-400">
						{endpoint.description}
					</p>

					<div class="mt-6">
						<CodeBlock language={selectedLanguage} {endpoint} />
					</div>
				</section>
			{/each}
		</div>
	</main>

	<!-- Right Sidebar - Table of Contents -->
	<aside class="hidden w-64 border-l border-gray-200 lg:block dark:border-gray-700">
		<div class="sticky top-0 p-4">
			<h4 class="text-sm font-semibold text-gray-500">On this page</h4>
			<nav class="mt-4">
				{#each endpoints as endpoint}
					<a
						href="#{endpoint.path}"
						class="block py-2 text-sm text-gray-600 hover:text-gray-900
                     dark:text-gray-400 dark:hover:text-gray-200"
					>
						{endpoint.path}
					</a>
				{/each}
			</nav>
		</div>
	</aside>
</div>
