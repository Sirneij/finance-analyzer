<script lang="ts">
	import { onMount } from 'svelte';
	import Prism from 'prismjs';
	import type { Endpoint, SupportedLanguage } from '$lib/types/docs.types';

	let { endpoint, language }: { endpoint: Endpoint; language: SupportedLanguage } = $props();

	let copied = $state(false);

	const code = $derived(endpoint.examples.find((ex) => ex.language === language)?.code || '');
	const formattedResponses = $derived(
		endpoint.responses.map((response) => ({
			...response,
			formattedExample: JSON.stringify(response.example, null, 2)
		}))
	);

	onMount(() => {
		Prism.highlightAll();
	});

	async function copyCode() {
		await navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="space-y-6">
	<!-- Request Example -->
	<div class="rounded-lg border dark:border-gray-700">
		<div class="flex items-center justify-between border-b p-4 dark:border-gray-700">
			<h3 class="text-sm font-medium">Request Example</h3>
			<button
				onclick={copyCode}
				class="rounded-md bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200
                 dark:bg-gray-800 dark:hover:bg-gray-700"
			>
				{copied ? 'Copied!' : 'Copy'}
			</button>
		</div>
		<pre class="overflow-x-auto p-4"><code class="language-{language}">{code}</code></pre>
	</div>

	<!-- Parameters Section -->
	{#if endpoint.parameters?.length}
		<div class="rounded-lg border dark:border-gray-700">
			<div class="border-b p-4 dark:border-gray-700">
				<h3 class="text-sm font-medium">Parameters</h3>
			</div>
			<div class="divide-y dark:divide-gray-700">
				{#each endpoint.parameters as param}
					<div class="grid grid-cols-3 gap-4 p-4">
						<div class="font-mono text-sm">{param.name}</div>
						<div class="text-sm text-gray-600 dark:text-gray-400">
							{param.type}
							{#if param.required}
								<span class="ml-2 text-red-500">Required</span>
							{/if}
						</div>
						<div class="text-sm text-gray-600 dark:text-gray-400">
							{param.description}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Response Examples -->
	{#if endpoint.responses?.length}
		<div class="rounded-lg border dark:border-gray-700">
			<div class="border-b p-4 dark:border-gray-700">
				<h3 class="text-sm font-medium">Responses</h3>
			</div>
			{#each formattedResponses as response}
				<div class="p-4">
					<div class="mb-2 flex items-center gap-2">
						<span class="rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
							{response.status}
						</span>
						<span class="text-sm text-gray-600 dark:text-gray-400">
							{response.description}
						</span>
					</div>
					<pre class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800"><code class="language-json"
							>{response.formattedExample}</code
						></pre>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	pre {
		margin: 0;
		background: transparent;
	}
	code {
		font-family: ui-monospace, monospace;
		font-size: 0.875rem;
	}
</style>
