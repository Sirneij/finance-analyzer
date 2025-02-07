<script lang="ts">
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface PageTransitionProps extends HTMLAttributes<HTMLElement> {
		key: string;
		duration?: number;
		children: Snippet;
	}

	let { key, duration = SLIDE_DURATION - 100, children, ...props }: PageTransitionProps = $props();

	let transitionKey = $state('');

	$effect(() => {
		if (key) {
			transitionKey = key.split('#')[0];
		}
	});

	// Mac-like transition
	function macTransition(node: HTMLElement, { duration }: { duration: number }) {
		return {
			duration,
			css: (t: number) => {
				const scale = 0.95 + t * 0.05; // Scale from 95% to 100%
				const opacity = t;
				return `
                    transform: scale(${scale});
                    opacity: ${opacity};
                `;
			}
		};
	}
</script>

{#key transitionKey}
	<div {...props} in:macTransition={{ duration }}>
		{@render children()}
	</div>
{/key}

<style>
	div {
		position: absolute;
		inset: 0;
		transform-origin: center;
		will-change: transform, opacity;
	}
</style>
