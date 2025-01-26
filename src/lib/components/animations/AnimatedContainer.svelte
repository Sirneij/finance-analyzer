<script lang="ts">
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';
	interface AnimatedContainerProps extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { children, ...props }: AnimatedContainerProps = $props();
</script>

<section in:fade={{ duration: SLIDE_DURATION }} {...props}>
	{@render children()}
</section>
