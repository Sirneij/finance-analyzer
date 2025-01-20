<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import MethodBadge from '$lib/components/docs/MethodBadge.svelte';
	import Delete from '$lib/components/icons/Delete.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';
	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';
	import Add from '$lib/components/icons/Add.svelte';
	import { addNotification } from '$lib/states/notification';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';

	let { data }: { data: PageData } = $props();

	const handleDelete: SubmitFunction = async () => {
		return async ({ result, update }) => {
			if (result.type === 'success' || result.type === 'redirect') {
				addNotification('Endpoint docs deleted successfully', 'success');
				await update();
			}
			await applyAction(result);
		};
	};
</script>

<AnimatedContainer class="container mx-auto">
	<AnimatedSection
		class="mb-4 flex items-center justify-between rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
		y={30}
	>
		<div>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white">API Docs</h2>
			<p class="text-gray-600 dark:text-gray-400">Browse all available API docs</p>
		</div>
		<div class="flex items-center space-x-4">
			<a
				href="/finanalyzer/documentation/create"
				class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400"
			>
				<Add class="h-5 w-5" />
				Create Doc
			</a>
			<a
				href="/finanalyzer/docs"
				class="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
			>
				View all docs
			</a>
		</div>
	</AnimatedSection>

	<AnimatedSection class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" x={-50} delay={200}>
		{#each data.docs as endpoint (endpoint._id)}
			<div
				animate:flip={{ duration: 300 }}
				in:fade|local={{ duration: 300 }}
				out:slide|local={{ duration: 300 }}
				class="group relative block w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
			>
				<form method="POST" action="?/deleteEndpoint" use:enhance={handleDelete}>
					<input type="hidden" name="id" value={endpoint._id} />
					<button
						type="submit"
						class="absolute right-0 top-0 hidden rounded-full p-1.5 text-red-500 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:inline-flex group-hover:opacity-100 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300"
						aria-label="Delete endpoint"
					>
						<Delete class="h-5 w-5" />
					</button>
				</form>

				<a href={`documentation/${endpoint._id}`}>
					<div class="flex items-center justify-between">
						<MethodBadge method={endpoint.method} />
						<span class="text-sm font-medium text-gray-500 dark:text-gray-400">
							{endpoint.category}
						</span>
					</div>
					<p class="mt-4 text-left font-mono text-sm text-gray-900 dark:text-white">
						{endpoint.path}
					</p>
				</a>
			</div>
		{/each}
	</AnimatedSection>
</AnimatedContainer>
