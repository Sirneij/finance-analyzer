<script lang="ts">
	import { receive, send } from '$lib/utils/helpers/misc.transitions';
	import type { ActionData } from '../../../routes/$types';

	const { form }: { form: ActionData | null } = $props();
</script>

{#if form?.errors}
	<!-- Error Message Display -->
	{#each form?.errors as error (error.id)}
		<p
			class="mb-4 p-3 text-center italic text-red-500"
			in:receive={{ key: error.id }}
			out:send={{ key: error.id }}
		>
			{error.error}
		</p>
	{/each}
{/if}
