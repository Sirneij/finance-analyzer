<script lang="ts">
	import type { Tag } from '$lib/types/tags.types';
	import { showInfo } from '$lib/utils/helpers/editor/markdown.helpers';
	import { getEditorState, setEditorState } from '$lib/utils/helpers/editor/blogs.helpers';
	import { onMount } from 'svelte';

	type Props = {
		container: HTMLDivElement;
		tagsFromServer: Tag[];
	};

	let { tagsFromServer, container = $bindable() }: Props = $props();

	let tagContainer = $state<HTMLDivElement>();
	let suggestionPanel = $state<HTMLDivElement>();
	let tagInput = $state<HTMLInputElement>();
	let inputValue = $state('');
	let selectedTags = $state<Tag[]>([]);
	let filteredTags = $state<Tag[]>([]);

	// Filter tags as user types
	$effect(() => {
		if (!inputValue) {
			filteredTags = [];
			return;
		}

		const searchTerm = inputValue.toLowerCase();
		filteredTags = tagsFromServer
			.filter(
				(tag) =>
					tag.name.toLowerCase().includes(searchTerm) &&
					!selectedTags.some((selected) => selected.id === tag.id)
			)
			.slice(0, 5);
	});

	function addTag(tag: Tag) {
		if (selectedTags.length >= 4 || selectedTags.some((t) => t.id === tag.id)) return;
		selectedTags = [...selectedTags, tag];
		inputValue = '';
		setEditorState({ tags: selectedTags.map((t) => t.name) });
	}

	function removeTag(tagId: string) {
		selectedTags = selectedTags.filter((tag) => tag.id !== tagId);
		setEditorState({ tags: selectedTags.map((t) => t.name) });
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === ',' && inputValue) {
			event.preventDefault();
			const matchingTag = tagsFromServer.find(
				(tag) => tag.name.toLowerCase() === inputValue.toLowerCase()
			);
			if (matchingTag) addTag(matchingTag);
		}
	}

	onMount(() => {
		const state = getEditorState();
		if (state.tags?.length) {
			selectedTags = state.tags
				.map((tagName) => tagsFromServer.find((t) => t.name === tagName))
				.filter(Boolean) as Tag[];
		}
	});
</script>

<div class="space-y-2">
	<div class="flex flex-wrap gap-2">
		{#each selectedTags as tag}
			<span
				class="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm dark:bg-indigo-900"
			>
				#{tag.name}
				<button
					type="button"
					class="ml-2 text-indigo-400 hover:text-indigo-600"
					onclick={() => removeTag(tag.id)}
				>
					×
				</button>
			</span>
		{/each}
	</div>

	<div class="relative">
		<input
			bind:this={tagInput}
			bind:value={inputValue}
			use:showInfo={{ container, infoId: 'tags-info' }}
			type="text"
			class="w-full rounded-md border-gray-300 bg-transparent px-3 py-2 text-gray-800 dark:text-white"
			placeholder={selectedTags.length >= 4 ? 'Max tags reached' : 'Add up to 4 tags...'}
			onkeydown={handleKeydown}
			disabled={selectedTags.length >= 4}
		/>

		{#if filteredTags.length > 0}
			<div class="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg dark:bg-gray-800">
				{#each filteredTags as tag}
					<button
						type="button"
						class="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
						onclick={() => addTag(tag)}
					>
						<div class="font-medium">#{tag.name}</div>
						<div class="text-sm text-gray-500 dark:text-gray-400">{tag.description}</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
