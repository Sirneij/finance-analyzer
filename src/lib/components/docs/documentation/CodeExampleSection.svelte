<script lang="ts">
	import Close from '$lib/components/icons/Close.svelte';
	import { LANGUAGES } from '$lib/utils/contants';
	import MarkdownEditor from '$lib/components/docs/documentation/MarkdownEditor.svelte';
	import type { ExampleCode, FormState } from '$lib/types/docs.types';

	let { formState = $bindable() }: { formState: FormState } = $props();

	function addCodeExample() {
		formState.examples = [...formState.examples, { language: 'nodejs', code: '' }];
	}

	function removeExample(index: number) {
		formState.examples = formState.examples.filter((_: ExampleCode, i: number) => i !== index);
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Code Examples</h3>
		<button
			type="button"
			class="bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-600"
			onclick={addCodeExample}
		>
			Add Example
		</button>
	</div>
	{#each formState.examples as example, i}
		<div
			class="relative space-y-4 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
		>
			<button
				type="button"
				class="absolute right-2 top-2 p-1 text-gray-400 hover:bg-red-100 hover:text-red-500"
				onclick={() => removeExample(i)}
				aria-label="Remove example"
			>
				<Close class="h-5 w-5" />
			</button>

			<div class="space-y-1">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="language">
					Language
				</label>
				<select
					bind:value={example.language}
					class="block w-full px-4 py-2 outline-none dark:bg-gray-700 dark:text-white"
					id="language"
				>
					{#each LANGUAGES as lang}
						<option value={lang}>{lang}</option>
					{/each}
				</select>
			</div>

			<div class="space-y-1">
				<MarkdownEditor
					bind:value={example.code}
					id="code"
					rows={6}
					placeholder="// Your code example here"
					required={true}
				>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="code">
						Code
					</label>
				</MarkdownEditor>
			</div>
		</div>
	{/each}
</div>
