<script lang="ts">
	import type { Endpoint, HttpMethod, SupportedLanguage } from '$lib/types/docs.types';
	import type { PageData } from './$types';
	import EndpointSelector from '$lib/components/docs/documentation/EndpointSelector.svelte';
	import BasicInfo from '$lib/components/docs/documentation/BasicInfo.svelte';
	import ParameterSection from '$lib/components/docs/documentation/ParameterSection.svelte';
	import ResponseSection from '$lib/components/docs/documentation/ResponseSection.svelte';
	import CodeExampleSection from '$lib/components/docs/documentation/CodeExampleSection.svelte';
	import FormError from '$lib/components/resuables/FormError.svelte';
	import Loader from '$lib/components/resuables/Loader.svelte';
	import { addNotification } from '$lib/states/notification';

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
		form = $state({ errors: [] }),
		isCreating = $state(false);

	const createDocs = async (
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) => {
		isCreating = true;
		event.preventDefault();

		const response = await fetch('/api/docs/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formState)
		});

		isCreating = false;

		if (!response.ok) {
			const data = await response.json();
			form.errors = data.errors;
		}
		addNotification('Documentation created successfully', 'success');

		// reset formState
		formState = {
			path: '',
			method: 'GET',
			middlewares: [],
			category: '',
			description: '',
			params: [],
			responses: [],
			examples: []
		};
	};
</script>

<div class="mx-auto max-w-4xl space-y-6 p-6">
	<div class="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
		<div>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">API Documentation Builder</h2>
			<p class="text-sm text-gray-600 dark:text-gray-400">
				Create documentation for API endpoints.
			</p>
		</div>

		<FormError {form} />

		<div class="relative mb-4 mt-2">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
			</div>
		</div>

		<!-- Endpoint Selector -->
		<EndpointSelector endpoints={data.endpoints} bind:selectedEndpoint bind:formState />

		<form class="space-y-6" method="POST" onsubmit={createDocs}>
			<!-- Basic Info -->
			<BasicInfo bind:selectedEndpoint bind:formState />

			<!-- Parameters -->
			<ParameterSection bind:formState />

			<!-- Responses -->
			<ResponseSection bind:formState />

			<!-- Code Examples -->
			<CodeExampleSection bind:formState />

			<FormError {form} />

			<!-- Submit Button -->
			<div class="flex items-center justify-center">
				{#if isCreating}
					<Loader width={20} message="Creating Documentation..." />
				{:else}
					<button
						type="submit"
						class="bg-indigo-500 px-4 py-3 text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:hover:bg-indigo-400"
					>
						Save Documentation
					</button>
				{/if}
			</div>
		</form>
	</div>
</div>
