<script lang="ts">
	import type { Endpoint } from '$lib/types/docs.types';
	import MethodBadge from '$lib/components/docs/MethodBadge.svelte';
	import MarkdownEditor from '$lib/components/docs/documentation/MarkdownEditor.svelte';

	let {
		selectedEndpoint = $bindable(),
		formState = $bindable()
	}: {
		selectedEndpoint: Endpoint | null;
		formState: any;
	} = $props();
</script>

{#if selectedEndpoint}
	<div class="mb-4 flex items-center gap-3">
		<MethodBadge method={formState.method} />
		<span class="text-gray-900 dark:text-white">{formState.path}</span>
	</div>
{/if}

<!-- Category -->
<div>
	<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="category">
		Category*
	</label>
	<input
		required
		type="text"
		bind:value={formState.category}
		id="category"
		name="category"
		class="mt-1 block w-full px-3 py-2 outline-none dark:bg-gray-700 dark:text-white"
		placeholder="Authentication"
	/>
</div>

<!-- Description -->
<div>
	<MarkdownEditor
		bind:value={formState.description}
		id="description"
		rows={4}
		placeholder="Detailed description of the endpoint..."
		required={true}
	>
		<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="description">
			Description*
		</label>
	</MarkdownEditor>
</div>
