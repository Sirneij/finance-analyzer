<script lang="ts">
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import Caret from '$lib/components/icons/Caret.svelte';
	import type { Endpoint, FormState } from '$lib/types/docs.types';
	import Endpoints from './Endpoints.svelte';

	let {
		endpoints,
		selectedEndpoint = $bindable(),
		formState = $bindable()
	}: {
		endpoints: Endpoint[];
		selectedEndpoint: Endpoint | null;
		formState: FormState;
	} = $props();

	let isOpen = $state(false);

	function handleEndpointSelect(endpoint: Endpoint) {
		selectedEndpoint = endpoint;
		isOpen = false;

		// Populate form with endpoint data
		formState.path = endpoint.path;
		formState.method = endpoint.method;
		formState.middlewares = [...endpoint.middlewares];
	}
</script>

<AnimatedSection x={-50} class="relative mb-4">
	<button
		onclick={() => (isOpen = !isOpen)}
		class="flex w-full items-center justify-between bg-white px-4 py-3 text-left hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600"
	>
		<span class="text-gray-700 dark:text-gray-200">
			{selectedEndpoint?.path || 'Select an endpoint'}
		</span>
		<Caret trend={isOpen ? 'up' : 'down'} class="h-5 w-5 transition-transform dark:text-white" />
	</button>

	<Endpoints {endpoints} {isOpen} {handleEndpointSelect} />
</AnimatedSection>
