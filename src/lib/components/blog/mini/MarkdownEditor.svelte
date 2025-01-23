<script lang="ts">
	import MarkdownEditorToolbar from '$lib/components/blog/mini/MarkdownEditorToolbar.svelte';
	import { showInfo, useKeyCombinations } from '$lib/utils/helpers/editor/markdown.helpers';
	import TitleInput from '$lib/components/blog/mini/TitleInput.svelte';
	import { highlightCode, marked } from '$lib/utils/helpers/docs.helpers';
	import Settings from '$lib/components/icons/Settings.svelte';
	import ModelessDialog from '$lib/components/reusables/ModelessDialog.svelte';
	import { onMount } from 'svelte';
	import { getEditorState, setEditorState } from '$lib/utils/helpers/editor/blogs.helpers';
	import ImageInput from '$lib/components/blog/mini/ImageInput.svelte';
	import TagInput from './TagInput.svelte';
	import type { Tag } from '$lib/types/tags.types';

	let {
		container = $bindable(),
		textArea
	}: { container: HTMLDivElement; textArea: HTMLTextAreaElement } = $props();

	let textAreaContent = $state(''),
		coverImage = $state(''),
		isPreviewMode = $state(false),
		title = $state(''),
		containerHeight = $state(0),
		lineHeight = $state(20),
		isOpen = $state(false),
		triggerButton = $state<HTMLButtonElement>();

	let seriesName = $state('');
	let selectedSeries = $state('');
	const series = ['Series 1', 'Series 2', 'Series 3'];
	const tags: Tag[] = [
		{
			id: '1',
			name: 'javaScript',
			description:
				'JavaScript is a programming language that conforms to the ECMAScript specification.'
		},
		{
			id: '2',
			name: 'react',
			description: 'React is a JavaScript library for building user interfaces.'
		},
		{
			id: '3',
			name: 'svelte',
			description: 'Svelte is a radical new approach to building user interfaces.'
		},
		{
			id: '4',
			name: 'tailwindcss',
			description: 'A utility-first CSS framework for rapidly building custom designs.'
		},
		{
			id: '5',
			name: 'nodejs',
			description:
				'Node.js is an open-source, cross-platform, back-end JavaScript runtime environment.'
		},
		{
			id: '6',
			name: 'expressjs',
			description: 'Fast, unopinionated, minimalist web framework for Node.js.'
		},
		{
			id: '7',
			name: 'mongodb',
			description:
				'A general-purpose, document-based, distributed database built for modern application developers.'
		},
		{
			id: '8',
			name: 'postgresql',
			description: 'A powerful, open-source object-relational database system.'
		},
		{
			id: '9',
			name: 'firebase',
			description: 'A platform developed by Google for creating mobile and web applications.'
		},
		{
			id: '10',
			name: 'flutter',
			description: 'An open-source UI software development kit created by Google.'
		},
		{
			id: '11',
			name: 'dart',
			description: 'A client-optimized programming language for fast apps on any platform.'
		},
		{
			id: '12',
			name: 'python',
			description: 'An interpreted, high-level, general-purpose programming language.'
		},
		{
			id: '13',
			name: 'django',
			description:
				'A high-level Python web framework that encourages rapid development and clean, pragmatic design.'
		},
		{
			id: '14',
			name: 'flask',
			description: 'A lightweight WSGI web application framework.'
		},
		{
			id: '15',
			name: 'fastapi',
			description:
				'A modern, fast (high-performance), web framework for building APIs with Python 3.6+.'
		}
	];

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

	function onClose() {
		isOpen = false;
	}

	onMount(() => {
		const state = getEditorState();
		textAreaContent = state.content;
		coverImage = state.coverImage;
		title = state.title;
		selectedSeries = state.selectedSeries;
		seriesName = state.seriesName;
	});

	$effect(() => {
		setEditorState({
			content: textAreaContent,
			coverImage,
			title,
			selectedSeries,
			seriesName
		});
	});
</script>

<div class="flex h-[calc(100vh-12rem)] w-full flex-col transition-all duration-300" id="editor">
	<!-- Cover Image -->
	<ImageInput bind:coverImage />

	<form class="flex h-full flex-col">
		<TagInput bind:container tagsFromServer={tags} />
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
				<button
					bind:this={triggerButton}
					type="button"
					onclick={() => (isOpen = true)}
					class="rounded px-1 py-1 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-600"
					title="Post options"
				>
					<Settings class="h-5 w-5" />
				</button>
			</div>
		</div>
	</form>
</div>

<!-- Series Dialog -->

<ModelessDialog {isOpen} {onClose} title="Post Options" triggerEl={triggerButton}>
	<form class="space-y-4">
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="seriesName">
				Select Existing Series
			</label>
			<select
				id="seriesName"
				name="seriesName"
				bind:value={selectedSeries}
				class="mt-1 block w-full rounded-md bg-white px-3 py-2 text-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
			>
				<option value="">Select a series</option>
				{#each series as s}
					<option value={s}>{s}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="seriesName">
				Create New Series
			</label>
			<input
				type="text"
				id="seriesName"
				name="seriesName"
				bind:value={seriesName}
				class="mt-1 block w-full rounded-md bg-white px-3 py-2 text-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
				placeholder="Enter series name"
			/>
		</div>

		<div class="flex justify-end gap-2 pt-4">
			<button
				type="button"
				class="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				onclick={onClose}
			>
				Cancel
			</button>
			<button
				type="submit"
				class="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
			>
				Save
			</button>
		</div>
	</form>
</ModelessDialog>
