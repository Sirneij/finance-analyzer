<script lang="ts">
	import MarkdownEditor from '$lib/components/docs/documentation/MarkdownEditor.svelte';
	let { formState = $bindable() }: { formState: any } = $props();

	const addParameter = () => {
		formState.params = [
			...formState.params,
			{ name: '', type: '', required: false, description: '' }
		];
	};
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Parameters</h3>
		<button
			type="button"
			class="bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
			onclick={addParameter}
		>
			Add Parameter
		</button>
	</div>
	{#each formState.params as param, i}
		<div class="grid gap-4 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
			<div class="grid gap-4 md:grid-cols-3">
				<input
					bind:value={param.name}
					placeholder="Name"
					class="px-4 py-2 outline-none dark:bg-gray-700 dark:text-white"
				/>
				<input
					bind:value={param.type}
					placeholder="Type"
					class="px-4 py-2 outline-none dark:bg-gray-700 dark:text-white"
				/>
				<label class="flex items-center space-x-2">
					<input
						type="checkbox"
						bind:checked={param.required}
						class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700 dark:text-gray-300">Required</span>
				</label>
			</div>
			<MarkdownEditor
				bind:value={param.description}
				id="description"
				rows={4}
				placeholder="Parameter description"
				required={true}
			></MarkdownEditor>
		</div>
	{/each}
</div>
