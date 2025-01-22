<script lang="ts">
	import type { Endpoint } from '$lib/types/docs.types';
	import type { PageData } from './$types';
	import EndpointSelector from '$lib/components/docs/documentation/EndpointSelector.svelte';
	import BasicInfo from '$lib/components/docs/documentation/BasicInfo.svelte';
	import ParameterSection from '$lib/components/docs/documentation/ParameterSection.svelte';
	import ResponseSection from '$lib/components/docs/documentation/ResponseSection.svelte';
	import CodeExampleSection from '$lib/components/docs/documentation/CodeExampleSection.svelte';
	import FormError from '$lib/components/resuables/FormError.svelte';
	import Loader from '$lib/components/resuables/Loader.svelte';
	import { page } from '$app/state';
	import { addNotification } from '$lib/states/notification';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';

	let { data }: { data: PageData } = $props();

	let formState = $state(data.doc);

	let selectedEndpoint = $state<Endpoint | undefined>(
			data.endpoints.find((e: Endpoint) => e.path === formState.path)
		),
		form = $state({ errors: [] }),
		isUpdating = $state(false);

	const updateDocs = async (
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) => {
		isUpdating = true;
		event.preventDefault();

		const response = await fetch(`/finanalyzer/api/docs/${page.params.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formState)
		});

		isUpdating = false;

		if (!response.ok) {
			const data = await response.json();
			form.errors = data.errors;
		}
		addNotification('Documentation updated successfully', 'success');
	};
</script>

<AnimatedContainer class="mx-auto max-w-4xl space-y-6 p-6">
	<div class="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
		<AnimatedSection y={30}>
			<div>
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					API Documentation Update
				</h2>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Update documentation for API endpoints.
				</p>
			</div>

			<FormError {form} />

			<div class="relative mb-4 mt-2">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
				</div>
			</div>
		</AnimatedSection>

		<AnimatedSection y={40} delay={200}>
			<EndpointSelector endpoints={data.endpoints} bind:selectedEndpoint bind:formState />
		</AnimatedSection>

		<form class="space-y-6" method="POST" onsubmit={updateDocs}>
			<AnimatedSection y={50} delay={400}>
				<BasicInfo bind:selectedEndpoint bind:formState />
			</AnimatedSection>

			<AnimatedSection y={60} delay={600}>
				<ParameterSection bind:formState />
			</AnimatedSection>

			<AnimatedSection y={70} delay={800}>
				<ResponseSection bind:formState />
			</AnimatedSection>

			<AnimatedSection y={80} delay={1000}>
				<CodeExampleSection bind:formState />
			</AnimatedSection>

			<FormError {form} />

			<AnimatedSection y={-30} delay={1200} class="flex items-center justify-center">
				{#if isUpdating}
					<Loader width={20} message="Updating Documentation..." />
				{:else}
					<button
						type="submit"
						class="bg-indigo-500 px-4 py-3 text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:hover:bg-indigo-400"
					>
						Update Documentation
					</button>
				{/if}
			</AnimatedSection>
		</form>
	</div>
</AnimatedContainer>
