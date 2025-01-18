<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	let { isOpen, onClose, children } = $props();
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/50 backdrop-blur-sm"
			onclick={onClose}
			onkeydown={(e) => e.key === 'Escape' && onClose()}
			role="button"
			tabindex="0"
			aria-roledescription="dialog"
		></div>

		<!-- Modal -->
		<div
			class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
			transition:fly={{ y: 20, duration: 300 }}
		>
			{@render children()}
		</div>
	</div>
{/if}
