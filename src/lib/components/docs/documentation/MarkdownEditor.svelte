<script lang="ts">
	import { marked } from 'marked';
	import type { Snippet } from 'svelte';

	let {
		required,
		value = $bindable(),
		id,
		rows,
		placeholder,
		children
	}: {
		required: boolean;
		value: string;
		id: string;
		rows: number;
		placeholder: string;
		children?: Snippet;
	} = $props();

	let preview = $state(false);

	let htmlContent = $derived(marked.parse(value));
</script>

<div>
	<div class="mb-2 flex items-center justify-between">
		{#if children}
			{@render children()}
		{/if}
		<button
			type="button"
			class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
			onclick={() => (preview = !preview)}
		>
			{preview ? 'Edit' : 'Preview'}
		</button>
	</div>

	{#if preview}
		<div class="prose prose-blue max-w-none dark:prose-invert">{@html htmlContent}</div>
	{:else}
		<textarea
			{required}
			{rows}
			{placeholder}
			bind:value
			class="w-full px-4 py-2 outline-none dark:bg-gray-700 dark:text-white"
		></textarea>
	{/if}
</div>
