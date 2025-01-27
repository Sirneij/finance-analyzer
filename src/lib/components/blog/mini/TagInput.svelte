<script lang="ts">
	import { showInfo } from '$lib/utils/helpers/editor/markdown.helpers';
	import { getEditorState, setEditorState } from '$lib/utils/helpers/editor/blogs.helpers';
	import { onMount } from 'svelte';
	import Close from '$lib/components/icons/Close.svelte';
	import { fade, slide } from 'svelte/transition';
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import type { ITag } from '$lib/types/articles.types';

	type Props = {
		container: HTMLDivElement;
		tagsFromServer: ITag[];
	};

	let { tagsFromServer, container = $bindable() }: Props = $props();

	let tagInput = $state<HTMLInputElement>(),
		inputValue = $state(''),
		selectedTags = $state<ITag[]>([]),
		filteredTags = $state<ITag[]>([]),
		inputContainer = $state<HTMLDivElement>(),
		activeIndex = $state(-1);

	function handleKeyNavigation(event: KeyboardEvent) {
		if (!filteredTags.length) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				activeIndex = (activeIndex + 1) % filteredTags.length;
				break;
			case 'ArrowUp':
				event.preventDefault();
				activeIndex = activeIndex <= 0 ? filteredTags.length - 1 : activeIndex - 1;
				break;
			case 'Enter':
				event.preventDefault();
				if (activeIndex >= 0) {
					addTag(filteredTags[activeIndex]);
					activeIndex = -1;
				}
				break;
			case 'Escape':
				event.preventDefault();
				filteredTags = [];
				activeIndex = -1;
				break;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (inputContainer && !inputContainer.contains(event.target as Node)) {
			filteredTags = [];
			activeIndex = -1;
		}
	}

	function addTag(tag: ITag) {
		if (selectedTags.length >= 4 || selectedTags.some((t) => t._id === tag._id)) return;
		selectedTags = [...selectedTags, tag];
		inputValue = '';
		setEditorState({ tags: selectedTags.map((t) => t.name) });
	}

	function removeTag(tagId: string) {
		selectedTags = selectedTags.filter((tag) => tag._id !== tagId);
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

	function focusInput() {
		if (tagInput && !tagInput.disabled) {
			tagInput.focus();
		}
	}

	function handleTagRemove(event: Event, tagId: string) {
		event.stopPropagation();
		removeTag(tagId);
	}

	onMount(() => {
		const state = getEditorState();
		if (state.tags?.length) {
			selectedTags = state.tags
				.map((tagName) => tagsFromServer.find((t) => t.name === tagName))
				.filter(Boolean) as ITag[];
		}
	});

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
					!selectedTags.some((selected) => selected._id === tag._id)
			)
			.slice(0, 5);
	});

	const selectedTagsIds = $derived(selectedTags.map((tag) => tag._id).join(','));
</script>

<svelte:document onclick={handleClickOutside} />

<div class="space-y-2">
	<div
		bind:this={inputContainer}
		class="relative mt-4 flex w-full cursor-text flex-wrap items-center gap-1 rounded-md bg-transparent p-2 text-gray-800 dark:text-white"
		onclick={focusInput}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				focusInput();
			}
		}}
		tabindex="0"
		role="combobox"
		aria-expanded={filteredTags.length > 0}
		aria-haspopup="listbox"
		aria-controls="tag-suggestions"
	>
		{#each selectedTags as tag}
			<span class="tag {tag.name.toLowerCase()}" transition:fade>
				{tag.name}
				<button
					type="button"
					class="ml-2 text-red-400 transition-all hover:scale-110 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
					onclick={(e) => handleTagRemove(e, tag._id)}
					aria-label={`Remove ${tag.name} tag`}
				>
					<Close class="h-4 w-4" />
				</button>
			</span>
		{/each}

		<!-- Hidden input of selected tags ids -->
		<input type="hidden" name="tags" value={selectedTagsIds} />

		<input
			bind:this={tagInput}
			bind:value={inputValue}
			use:showInfo={{ container, infoId: 'tags-info' }}
			type="text"
			class="min-w-[120px] flex-1 bg-inherit text-gray-800 dark:text-white dark:placeholder-gray-400"
			placeholder={selectedTags.length >= 4 ? 'Max tags reached' : 'Add up to 4 tags...'}
			onkeydown={(e) => {
				handleKeydown(e);
				handleKeyNavigation(e);
			}}
			disabled={selectedTags.length >= 4}
			aria-label="Tag input"
			role="searchbox"
		/>
	</div>
	{#if filteredTags.length > 0}
		<ul
			id="tag-suggestions"
			class="absolute z-10 max-h-[250px] overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
			style="width: {inputContainer?.offsetWidth * 0.9}px"
			transition:fade
			role="listbox"
		>
			<h3 class="p-3 text-sm font-medium text-gray-800 dark:text-gray-200">Suggestions</h3>
			<div class="border-b border-gray-200 dark:border-gray-700"></div>
			{#each filteredTags as tag, i}
				<li
					role="option"
					class="flex cursor-pointer flex-col p-3 text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 {i ===
					activeIndex
						? 'bg-gray-100 dark:bg-gray-700'
						: ''}"
					onclick={() => addTag(tag)}
					onkeydown={(e) => e.key === 'Enter' && addTag(tag)}
					tabindex="0"
					aria-selected={i === activeIndex}
					transition:slide={{ duration: SLIDE_DURATION }}
				>
					<span class="tag {tag.name.toLowerCase()} borderless">
						{tag.name}
					</span>
					<small class="ml-6 mt-1 text-sm italic text-gray-500 dark:text-gray-400">
						{tag.description}
					</small>
				</li>
			{/each}
		</ul>
	{/if}
</div>
