<script lang="ts">
	import Close from '$lib/components/icons/Close.svelte';
	import type { ITag } from '$lib/types/articles.types';
	import { debounce } from '$lib/utils/helpers/resume.helpers.js';

	let { tags, selectedTags = $bindable() }: { tags: ITag[]; selectedTags: string[] } = $props();

	let tagSearch = $state('');

	const popularTags = $derived(tags.slice(0, 10));

	const filteredTags = $derived.by(() => {
		const query = tagSearch.toLowerCase();
		return query ? tags.filter((tag) => tag.name.toLowerCase().includes(query)) : popularTags;
	});

	const debouncedSearch = debounce((query: string) => {
		tagSearch = query;
	}, 300);
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">Tags</h3>

	<!-- Selected Tags -->
	{#if selectedTags.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each selectedTags as tag}
				<button
					class="tag {tag} active group flex items-center"
					onclick={() => (selectedTags = selectedTags.filter((t) => t !== tag))}
				>
					{tag}
					<Close class="ml-1 h-3 w-3 opacity-70 transition-opacity group-hover:opacity-100" />
				</button>
			{/each}
		</div>
	{/if}

	<!-- Tag Search -->
	<div class="relative">
		<input
			type="text"
			placeholder="Search tags..."
			bind:value={tagSearch}
			class="w-full rounded-md bg-white px-3 py-1.5 text-sm transition-all placeholder:text-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
		/>
	</div>

	<!-- Tag List -->
	<div class="max-h-48 overflow-y-auto">
		<div class="flex flex-wrap gap-2">
			{#each filteredTags as tag}
				<button
					class="tag {tag.name} {selectedTags.includes(tag.name) ? 'active' : ''}"
					onclick={() => {
						selectedTags = selectedTags.includes(tag.name)
							? selectedTags.filter((t) => t !== tag.name)
							: [...selectedTags, tag.name];
					}}
				>
					{tag.name}
				</button>
			{/each}
		</div>
	</div>

	{#if tagSearch && filteredTags.length === 0}
		<p class="text-center text-sm text-gray-500">
			No tags found matching "{tagSearch}"
		</p>
	{/if}
</div>
