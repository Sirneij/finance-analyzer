<script lang="ts">
	import type { PageData } from './$types';
	import TransactionTable from '$lib/components/transactions/TransactionTable.svelte';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import Paginations from '$lib/components/reusables/Paginations.svelte';

	let { data }: { data: PageData } = $props();
</script>

<AnimatedContainer class="w-full space-y-4">
	<AnimatedSection y={30} identifier={data.metadata.page}>
		<TransactionTable bind:transactions={data.transactions} />
	</AnimatedSection>
	<Paginations metadata={data.metadata} />
</AnimatedContainer>
