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
	import { page } from '$app/state';
	import FormError from '$lib/components/reusables/FormError.svelte';
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import Loader from '$lib/components/reusables/Loader.svelte';

	type EditorProps = {
		container: HTMLDivElement;
		textArea: HTMLTextAreaElement;
		title: string;
		foreImage: string;
		selectedSeries: string;
		textAreaContent: string;
		formActionURL: string;
	};

	let {
		container = $bindable(),
		textArea,
		title = $bindable(),
		foreImage = $bindable(),
		selectedSeries = $bindable(),
		textAreaContent = $bindable(),
		formActionURL
	}: EditorProps = $props();

	let isPreviewMode = $state(false),
		containerHeight = $state(0),
		lineHeight = $state(20),
		isOpen = $state(false),
		triggerButton = $state<HTMLButtonElement>(),
		formAction = $state('draft'),
		isCreating = $state(false),
		isSaving = $state(false);

	// Parse markdown preview
	let previewContent = $derived(marked.parse(textAreaContent));
	let isPublished = $derived(formAction === 'publish');

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
		textAreaContent = textAreaContent || state.content;
		foreImage = foreImage || state.foreImage;
		title = title || state.title;
		selectedSeries = selectedSeries || state.selectedSeries;
	});

	$effect(() => {
		setEditorState({
			content: textAreaContent,
			foreImage,
			title,
			selectedSeries
		});
	});

	const handlePostOptionsFormSubmit: SubmitFunction = async ({ cancel }) => {
		isSaving = true;
		if (selectedSeries) {
			isSaving = false;
			onClose();
			cancel();
		}
		return async ({ result }) => {
			isSaving = false;
			if (result.type === 'success' || result.type === 'redirect') {
				const res = result as any;
				if (res.data.success && res.data.series.length > 0) {
					selectedSeries = res.data.series[0]._id;
					onClose();
				}
			}
			await applyAction(result);
		};
	};

	const handleFormSubmit: SubmitFunction = async ({ submitter, formData }) => {
		isCreating = true;
		// Set publish status based on button clicked
		formAction = submitter?.dataset.action || 'draft';

		formData.append('isPublished', isPublished.toString());

		return async ({ result, update }) => {
			isCreating = false;
			if (result.type === 'success' || result.type === 'redirect') {
				await update();
			}
			await applyAction(result);
		};
	};
</script>

<div class="flex h-[calc(100vh-12rem)] w-full flex-col transition-all duration-300" id="editor">
	<FormError form={page.form} />
	<!-- Fore Image -->
	<ImageInput bind:foreImage />

	<form
		class="flex h-full flex-col"
		method="POST"
		action={formActionURL}
		use:enhance={handleFormSubmit}
	>
		<TagInput bind:container tagsFromServer={page.data.tags} />
		<!-- Title -->
		<TitleInput bind:container bind:title />

		<!-- Toolbar -->
		<div class="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
			<MarkdownEditorToolbar bind:textArea />
		</div>

		<!-- Editor -->
		<div class="relative flex-1 overflow-auto p-4">
			{#if isPreviewMode}
				<div class="prose prose-blue dark:prose-invert h-full max-w-none overflow-auto">
					{@html previewContent}
				</div>
			{:else}
				<textarea
					name="content"
					bind:this={textArea}
					bind:value={textAreaContent}
					use:showInfo={{ container: container, infoId: 'editor-info' }}
					use:useKeyCombinations
					class="h-full w-full resize-none bg-transparent font-mono text-gray-800 outline-none dark:text-gray-200"
					placeholder="Write your markdown content here..."
				></textarea>
			{/if}
		</div>

		<!-- Series hidden -->
		<input type="hidden" name="series" value={selectedSeries} />

		<!-- ForeImage hidden -->
		<input type="hidden" name="foreImage" value={foreImage} />

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
					type="submit"
					data-action="draft"
					class="rounded bg-gray-100 px-4 py-1 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				>
					Save Draft
				</button>
				<button
					type="submit"
					data-action="publish"
					class="rounded bg-indigo-600 px-4 py-1 text-sm font-medium text-white transition-all hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
				>
					Publish
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
	<form
		class="space-y-4"
		method="POST"
		action="/blogs/create?/savePostOptions"
		use:enhance={handlePostOptionsFormSubmit}
	>
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="series-title">
				Select Existing Series
			</label>
			<select
				id="series-title"
				name="series-title"
				bind:value={selectedSeries}
				class="mt-1 block w-full rounded-md bg-white px-3 py-2 text-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
			>
				<option value="">Select a series</option>
				{#each page.data.series as s}
					<option value={s._id}>{s.title}</option>
				{/each}
			</select>
		</div>

		<div>
			<label
				class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				for="newseries-title"
			>
				Create New Series
			</label>
			<input
				type="text"
				id="newseries-title"
				name="newseries-title"
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
			{#if isSaving}
				<Loader message="Saving..." width={20} />
			{:else}
				<button
					type="submit"
					class="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
					aria-label={selectedSeries ? 'Save existing series' : 'Create new series'}
				>
					Save
				</button>
			{/if}
		</div>
	</form>
</ModelessDialog>
