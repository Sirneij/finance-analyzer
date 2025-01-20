<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';
	interface AnimatedContainerProps extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { children, ...props }: AnimatedContainerProps = $props();
</script>

<section in:fade={{ duration: 1000 }} {...props}>
	{@render children()}
</section>
