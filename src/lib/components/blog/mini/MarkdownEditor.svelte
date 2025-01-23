<script lang="ts">
	import MarkdownEditorToolbar from '$lib/components/blog/mini/MarkdownEditorToolbar.svelte';
	import { showInfo, useKeyCombinations } from '$lib/utils/helpers/editor/markdown.helpers';
	import TitleInput from '$lib/components/blog/mini/TitleInput.svelte';
	import { highlightCode, marked } from '$lib/utils/helpers/docs.helpers';

	let {
		container = $bindable(),
		textArea
	}: { container: HTMLDivElement; textArea: HTMLTextAreaElement } = $props();

	let textAreaContent = $state(''),
		isPreviewMode = $state(false),
		title = $state(''),
		containerHeight = $state(0),
		lineHeight = $state(20);

	// Parse markdown preview
	let previewContent = $derived(marked.parse(textAreaContent));

	$effect(() => {
		if (textArea && container) {
			const observer = new ResizeObserver((entries) => {
				const entry = entries[0];
				containerHeight = entry.contentRect.height;
				const calculatedRows = Math.floor(containerHeight / lineHeight);
				textArea.rows = calculatedRows;
			});

			observer.observe(container);
			return () => observer.disconnect();
		}
	});

	$effect(() => {
		// In preview mode, highlight code blocks
		if (isPreviewMode) {
			highlightCode(container);
		}
	});
</script>

<div class="flex h-[calc(100vh-12rem)] w-full flex-col transition-all duration-300" id="editor">
	<form class="flex h-full flex-col">
		<!-- Title -->
		<TitleInput bind:container bind:title />

		<!-- Toolbar -->
		<div class="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
			<MarkdownEditorToolbar bind:textArea />
		</div>

		<!-- Editor -->
		<div class="relative flex-1 overflow-auto p-4">
			{#if isPreviewMode}
				<div class="prose prose-blue h-full max-w-none overflow-auto dark:prose-invert">
					{@html previewContent}
				</div>
			{:else}
				<textarea
					bind:this={textArea}
					bind:value={textAreaContent}
					use:showInfo={{ container: container, infoId: 'editor-info' }}
					use:useKeyCombinations
					class="h-full w-full resize-none bg-transparent font-mono text-gray-800 outline-none dark:text-gray-200"
					placeholder="Write your markdown content here..."
				></textarea>
			{/if}
		</div>

		<!-- Status Bar -->
		<div
			class="flex items-center justify-between border-t border-gray-200 px-4 py-2 dark:border-gray-700"
		>
			<div class="text-sm text-gray-500 dark:text-gray-400">
				{textAreaContent.length} characters
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={() => (isPreviewMode = !isPreviewMode)}
					class="rounded bg-gray-100 px-4 py-1 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				>
					{isPreviewMode ? 'Edit' : 'Preview'}
				</button>
				<button
					class="rounded bg-indigo-600 px-4 py-1 text-sm font-medium text-white transition-all hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
				>
					Save
				</button>
			</div>
		</div>
	</form>
</div>
