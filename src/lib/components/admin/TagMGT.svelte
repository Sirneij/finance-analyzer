<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import ModelessDialog from '$lib/components/reusables/ModelessDialog.svelte';
	import Empty from '$lib/components/reusables/Empty.svelte';
	import FormError from '$lib/components/reusables/FormError.svelte';
	import Loader from '$lib/components/reusables/Loader.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { addNotification } from '$lib/states/notification.svelte';
	import { page } from '$app/state';
	import Delete from '../icons/Delete.svelte';
	import { fly } from 'svelte/transition';
	import type { CreateTagInput } from '$lib/types/articles.types';

	let isCreatingTag = $state(false),
		triggerEl = $state<HTMLButtonElement>(),
		isOpen = $state(false),
		tagInputs = $state<CreateTagInput[]>([{ name: '', description: '' }]);

	function addTagField() {
		tagInputs = [...tagInputs, { name: '', description: '' }];
	}

	function removeTagField(index: number) {
		tagInputs = tagInputs.filter((_, i) => i !== index);
	}

	const handleTagSubmit: SubmitFunction = async ({ formData }) => {
		isCreatingTag = true;
		tagInputs.forEach((tag, i) => {
			formData.append(`tags[${i}][name]`, tag.name);
			formData.append(`tags[${i}][description]`, tag.description);
		});
		return async ({ result, update }) => {
			isCreatingTag = false;
			if (result.type === 'success') {
				const res = result as any;
				if (res.data.deleted) {
					addNotification('Tag deleted successfully', 'success');
				} else {
					addNotification('Tag created successfully', 'success');
					isOpen = false;
					tagInputs = [{ name: '', description: '' }];
				}

				await update();
			}
			await applyAction(result);
		};
	};
</script>

<AnimatedSection y={40} delay={400} class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Tags</h2>
		<button
			bind:this={triggerEl}
			onclick={() => (isOpen = true)}
			class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:hover:bg-indigo-400"
		>
			Create Tag
		</button>
	</div>

	<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
		{#if page.data.tags?.length}
			<div class="flex flex-wrap gap-2">
				{#each page.data.tags as tag}
					<div class="tag group relative {tag.name.toLowerCase()}">
						<span class="text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>

						{#if tag.description}
							<div
								class="pointer-events-none invisible absolute -top-16 left-1/2 z-50 min-w-[200px] max-w-[300px] -translate-x-1/2 whitespace-normal rounded bg-gray-800 px-2 py-1 text-center text-xs text-white group-hover:visible dark:bg-gray-700"
								transition:fly={{ y: 10, duration: 200 }}
							>
								{tag.description}
								<div
									class="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-800 dark:bg-gray-700"
								></div>
							</div>
						{/if}
						<form method="POST" action="?/deleteTag" use:enhance={handleTagSubmit}>
							<input type="hidden" name="tagId" value={tag._id} />
							{#if isCreatingTag}
								<Loader width={20} message="" />
							{:else}
								<button
									type="submit"
									class="rounded-full p-1 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-red-400"
									aria-label="Delete tag"
								>
									<Delete class="h-4 w-4" />
								</button>
							{/if}
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<Empty title="No tags found" description="Create your first tag" />
		{/if}
	</div>
</AnimatedSection>

<!-- Create Tag Dialog -->
<ModelessDialog {isOpen} onClose={() => (isOpen = false)} {triggerEl}>
	<div class="space-y-6">
		<h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Create Tags</h2>
		<FormError form={page.form} />
		<form
			method="POST"
			action="?/createTag"
			use:enhance={handleTagSubmit}
			class="max-h-72 space-y-4 overflow-y-scroll"
		>
			{#each tagInputs as tag, i (i)}
				<div class="relative space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
					{#if i > 0}
						<button
							type="button"
							class="absolute right-2 top-2 text-red-500"
							onclick={() => removeTagField(i)}
						>
							<Delete class="h-4 w-4" />
						</button>
					{/if}

					<div>
						<label
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							for="tag-name-{i}"
						>
							Tag Name
						</label>
						<input
							type="text"
							id="tag-name-{i}"
							bind:value={tag.name}
							required
							class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							placeholder="Enter tag name"
						/>
					</div>
					<div>
						<label
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							for="tag-description-{i}"
						>
							Tag Description
						</label>
						<textarea
							id="tag-description-{i}"
							bind:value={tag.description}
							class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							placeholder="Enter tag description"
						></textarea>
					</div>
				</div>
			{/each}
			<button
				type="button"
				class="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-500 hover:border-indigo-500 hover:text-indigo-500 dark:border-gray-700 dark:text-gray-400"
				onclick={addTagField}
			>
				Add Another Tag
			</button>

			<div class="flex justify-end gap-2">
				<button
					type="button"
					class="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
					onclick={() => (isOpen = false)}
				>
					Cancel
				</button>
				<button
					type="submit"
					class="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 dark:hover:bg-indigo-400"
					disabled={isCreatingTag}
				>
					{#if isCreatingTag}
						<Loader width={20} message="Creating..." />
					{:else}
						Create Tags
					{/if}
				</button>
			</div>
		</form>
	</div>
</ModelessDialog>
