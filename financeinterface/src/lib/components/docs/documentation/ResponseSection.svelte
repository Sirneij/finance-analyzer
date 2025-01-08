<script lang="ts">
	import Close from '$lib/components/icons/Close.svelte';
	import MarkdownEditor from '$lib/components/docs/documentation/MarkdownEditor.svelte';

	let { formState = $bindable() }: { formState: any } = $props();

	const addResponse = () => {
		formState.responses = [...formState.responses, { status: 200, description: '', example: '{}' }];
	};

	const removeResponse = (index: number) => {
		formState.responses = formState.responses.filter((_: any, i: number) => i !== index);
	};
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Responses</h3>
		<button
			type="button"
			class="bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
			onclick={addResponse}
		>
			Add Response
		</button>
	</div>
	{#each formState.responses as response, i}
		<div
			class="relative space-y-4 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
		>
			<!-- Add delete button -->
			<button
				type="button"
				class="absolute right-2 top-2 p-1 text-gray-400 hover:bg-red-100 hover:text-red-500"
				onclick={() => removeResponse(i)}
				aria-label="Remove response"
			>
				<Close class="h-5 w-5" />
			</button>

			<!-- Existing fields with improved styling -->
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-1">
					<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="status">
						Status Code
					</label>
					<input
						id="status"
						type="number"
						bind:value={response.status}
						placeholder="200"
						class="w-full px-4 py-2 outline-none dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div class="space-y-1">
					<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="description">
						Description
					</label>
					<input
						id="description"
						bind:value={response.description}
						placeholder="Success response"
						class="w-full px-4 py-2 outline-none dark:bg-gray-700 dark:text-white"
					/>
				</div>
			</div>
			<div class="space-y-1">
				<MarkdownEditor
					bind:value={response.example}
					id="example"
					rows={4}
					placeholder={`{"message": "Resource created successfully"}`}
					required={false}
				>
					<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="example">
						Example JSON
					</label>
				</MarkdownEditor>
			</div>
		</div>
	{/each}
</div>
