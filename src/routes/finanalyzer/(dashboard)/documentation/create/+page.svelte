<script lang="ts">
	import type { Endpoint, FormState, HttpMethod } from '$lib/types/docs.types';
	import type { PageData } from './$types';
	import EndpointSelector from '$lib/components/docs/documentation/EndpointSelector.svelte';
	import BasicInfo from '$lib/components/docs/documentation/BasicInfo.svelte';
	import ParameterSection from '$lib/components/docs/documentation/ParameterSection.svelte';
	import ResponseSection from '$lib/components/docs/documentation/ResponseSection.svelte';
	import CodeExampleSection from '$lib/components/docs/documentation/CodeExampleSection.svelte';
	import FormError from '$lib/components/resuables/FormError.svelte';
	import Loader from '$lib/components/resuables/Loader.svelte';
	import { addNotification } from '$lib/states/notification';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';

	let { data }: { data: PageData } = $props();

	let formState: FormState = $state({
		path: '',
		method: 'GET' as HttpMethod,
		middlewares: [] as string[],
		category: '',
		description: '',
		params: [],
		responses: [],
		examples: []
	});

	let selectedEndpoint = $state<Endpoint | null>(null),
		form = $state({ errors: [] }),
		isCreating = $state(false);

	const createDocs = async (
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) => {
		isCreating = true;
		event.preventDefault();

		const response = await fetch('/finanalyzer/api/docs/create', {
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

<AnimatedContainer class="mx-auto max-w-4xl space-y-6 p-6">
	<div class="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
		<!-- Header Section -->
		<AnimatedSection y={30}>
			<div>
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					API Documentation Builder
				</h2>
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
		</AnimatedSection>

		<!-- Endpoint Selector with slight delay -->
		<AnimatedSection y={40} delay={200}>
			<EndpointSelector endpoints={data.endpoints} bind:selectedEndpoint bind:formState />
		</AnimatedSection>

		<form class="space-y-6" method="POST" onsubmit={createDocs}>
			<!-- Basic Info -->
			<AnimatedSection y={50} delay={400}>
				<BasicInfo bind:selectedEndpoint bind:formState />
			</AnimatedSection>

			<!-- Parameters -->
			<AnimatedSection y={60} delay={600}>
				<ParameterSection bind:formState />
			</AnimatedSection>

			<!-- Responses -->
			<AnimatedSection y={70} delay={800}>
				<ResponseSection bind:formState />
			</AnimatedSection>

			<!-- Code Examples -->
			<AnimatedSection y={80} delay={1000}>
				<CodeExampleSection bind:formState />
			</AnimatedSection>

			<FormError {form} />

			<!-- Submit Button -->
			<AnimatedSection y={-30} delay={1200} class="flex items-center justify-center">
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
			</AnimatedSection>
		</form>
	</div>
</AnimatedContainer>
