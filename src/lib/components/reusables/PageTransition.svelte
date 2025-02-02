<script lang="ts">
	import { slide } from 'svelte/transition';
	let { duration, key, children } = $props();

	let transitionKey = $state('');

	$effect(() => {
		if (key) {
			transitionKey = key.split('#')[0];
		}
	});
</script>

{#key transitionKey}
	<div in:slide={{ duration, delay: duration }} out:slide={{ duration }}>
		{@render children()}
	</div>
{/key}

<style>
	div {
		position: absolute;
		inset: 0;
	}
</style>
