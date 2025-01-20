<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	interface AnimatedSectionProps extends HTMLAttributes<HTMLElement> {
		x?: number;
		y?: number;
		duration?: number;
		delay?: number;
		identifier?: string | number;
		children: Snippet;
	}

	let { x, y, duration, delay, identifier, children, ...props }: AnimatedSectionProps = $props();
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	const getFlyParams = () => {
		const params: { x?: number; y?: number; duration: number; delay?: number } = { duration: 1000 };
		if (x !== undefined) params.x = x;
		if (y !== undefined) params.y = y;
		if (duration !== undefined) params.duration = duration;
		if (delay !== undefined) params.delay = delay;
		return params;
	};

	// Combine identifier with mounted state to ensure both triggers work
	const key = $derived(`${identifier ?? ''}-${mounted}`);
</script>

{#key key}
	<section in:fly={getFlyParams()} {...props}>
		{@render children()}
	</section>
{/key}
