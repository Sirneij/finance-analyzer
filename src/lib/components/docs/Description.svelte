<script lang="ts">
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import { marked } from 'marked';
	import MethodBadge from './MethodBadge.svelte';
	import { getStatusColorClass } from '$lib/utils/helpers/docs.helpers';
	import hljs from 'highlight.js';

	let { currentDoc } = $props();

	let descriptionContainer = $state<HTMLDivElement>();

	function highlightCode() {
		requestAnimationFrame(() => {
			const codeBlocks = descriptionContainer?.querySelectorAll('pre code');
			codeBlocks?.forEach((codeBlock) => {
				if (codeBlock instanceof HTMLElement) {
					try {
						hljs.highlightElement(codeBlock);
					} catch (error) {
						console.error('Error applying syntax highlighting:', error);
					}
				}
			});
		});
	}

	$effect(() => {
		if (descriptionContainer && currentDoc) {
			highlightCode();
		}
	});
</script>

<div class="space-y-8" bind:this={descriptionContainer}>
	<AnimatedSection y={20}>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
			{currentDoc.path}
		</h1>
		<div class="mt-4 flex flex-wrap items-center gap-2">
			<MethodBadge method={currentDoc.method} />

			<span class="text-sm text-gray-600 dark:text-gray-400">
				{currentDoc.category}
			</span>
		</div>
	</AnimatedSection>

	<AnimatedSection y={30} class="prose prose-blue max-w-none dark:prose-invert" delay={200}>
		{@html marked(currentDoc.description)}
	</AnimatedSection>

	{#if currentDoc.responses.length}
		<AnimatedSection y={40} class="space-y-4" delay={400}>
			<h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Responses</h2>
			{#each currentDoc.responses as response}
				<div
					class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 sm:p-6"
				>
					<div class="mb-4 flex flex-wrap items-center gap-2">
						<span
							class="rounded-full bg-gradient-to-r px-4 py-1 text-xs font-medium text-white shadow-sm {getStatusColorClass(
								response.status
							)}"
						>
							{response.status}
						</span>
						<span class="text-sm text-gray-600 dark:text-gray-400">
							{@html marked(response.description)}
						</span>
					</div>
					<div class="prose prose-blue max-w-none dark:prose-invert">
						{@html marked(response.example)}
					</div>
				</div>
			{/each}
		</AnimatedSection>
	{/if}
</div>
