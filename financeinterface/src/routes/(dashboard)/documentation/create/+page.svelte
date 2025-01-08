<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { Endpoint, HttpMethod, SupportedLanguage } from '$lib/types/docs.types';
	import type { PageData } from './$types';
	import Caret from '$lib/components/icons/Caret.svelte';
	import MethodBadge from '$lib/components/docs/MethodBadge.svelte';

	let { data }: { data: PageData } = $props();

	let formState = $state({
		path: '',
		method: 'GET' as HttpMethod,
		middlewares: [] as string[],
		category: '',
		description: '',
		params: [] as { name: string; type: string; required: boolean; description: string }[],
		responses: [] as { status: number; description: string; example: string }[],
		examples: [] as { language: SupportedLanguage; code: string }[]
	});

	let selectedEndpoint = $state<Endpoint | null>(null),
		isDropdownOpen = $state(false);

	const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
	const languages: SupportedLanguage[] = ['nodejs', 'python', 'go', 'rust'];

	// Update form when endpoint is selected
	function handleEndpointSelect(endpoint: Endpoint) {
		selectedEndpoint = endpoint;
		isDropdownOpen = false;

		// Populate form with endpoint data
		formState.path = endpoint.path;
		formState.method = endpoint.method;
		formState.middlewares = [...endpoint.middlewares];
	}

	// Helper functions for adding items
	function addCodeExample() {
		formState.examples = [...formState.examples, { language: 'nodejs', code: '' }];
	}

	function addResponse() {
		formState.responses = [...formState.responses, { status: 200, description: '', example: '{}' }];
	}

	function removeResponse(index: number) {
		formState.responses = formState.responses.filter((_, i) => i !== index);
	}

	function removeExample(index: number) {
		formState.examples = formState.examples.filter((_, i) => i !== index);
	}
</script>

<div class="mx-auto max-w-4xl space-y-6 p-6">
	<div class="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
		<div>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">API Documentation Builder</h2>
			<p class="text-sm text-gray-600 dark:text-gray-400">
				Create documentation for API endpoints.
			</p>
		</div>

		<div class="relative mb-4 mt-2">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
			</div>
		</div>

		<!-- Endpoint Selector -->
		<div class="relative mb-8">
			<button
				onclick={() => (isDropdownOpen = !isDropdownOpen)}
				class="flex w-full items-center justify-between bg-white px-4 py-3 text-left hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600"
			>
				<span class="text-gray-700 dark:text-gray-200">
					{selectedEndpoint?.path || 'Select an endpoint'}
				</span>
				<Caret
					trend={isDropdownOpen ? 'up' : 'down'}
					class="h-5 w-5 transition-transform dark:text-white"
				/>
			</button>

			{#if isDropdownOpen}
				<div transition:slide class="absolute z-10 mt-2 w-full bg-white shadow-lg dark:bg-gray-700">
					{#each data.endpoints as endpoint}
						<button
							onclick={() => handleEndpointSelect(endpoint)}
							class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
						>
							<MethodBadge method={endpoint.method} />
							<span class="ml-2 text-gray-800 dark:text-gray-200">{endpoint.path}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<form class="space-y-6">
			<!-- Basic Info -->
			{#if selectedEndpoint}
				<div class="flex items-center gap-3">
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
					id="category"
					name="category"
					class="mt-1 block w-full px-3 py-2 outline-none dark:bg-gray-700 dark:text-white"
					placeholder="Authentication"
				/>
			</div>

			<!-- Description -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="description">
					Description*
				</label>
				<textarea
					required
					id="description"
					name="description"
					rows="4"
					class="mt-1 block w-full px-3 py-2 outline-none dark:bg-gray-700 dark:text-white"
					placeholder="Detailed description of the endpoint..."
				></textarea>
			</div>

			<!-- Parameters -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Parameters</h3>
					<button
						type="button"
						class="bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
						onclick={() =>
							(formState.params = [
								...formState.params,
								{ name: '', type: '', required: false, description: '' }
							])}
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
						<textarea
							bind:value={param.description}
							placeholder="Parameter description"
							class="px-4 py-2 outline-none dark:bg-gray-700 dark:text-white"
						></textarea>
					</div>
				{/each}
			</div>

			<!-- Responses -->
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
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
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
								<label
									class="text-sm font-medium text-gray-700 dark:text-gray-300"
									for="description"
								>
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
							<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="example">
								Example JSON
							</label>
							<textarea
								id="example"
								bind:value={response.example}
								placeholder={`{"message": "Resource created successfully"}`}
								rows="4"
								class="w-full px-4 py-2 outline-none dark:bg-gray-700 dark:text-white"
							></textarea>
						</div>
					</div>
				{/each}
			</div>

			<!-- Code Examples -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Code Examples</h3>
					<button
						type="button"
						class="bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
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
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
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
								{#each languages as lang}
									<option value={lang}>{lang}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-1">
							<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="code">
								Code
							</label>
							<textarea
								id="code"
								bind:value={example.code}
								placeholder="// Your code example here"
								rows="6"
								class="w-full px-4 py-2 outline-none dark:bg-gray-700 dark:text-white"
							></textarea>
						</div>
					</div>
				{/each}
			</div>

			<!-- Submit Button -->
			<div class="flex items-center justify-center">
				<button
					type="submit"
					class="bg-blue-500 px-4 py-3 text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:bg-blue-400"
				>
					Save Documentation
				</button>
			</div>
		</form>
	</div>
</div>
