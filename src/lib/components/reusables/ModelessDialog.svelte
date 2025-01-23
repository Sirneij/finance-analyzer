<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import Close from '$lib/components/icons/Close.svelte';

	let {
		isOpen = false,
		onClose,
		title = '',
		maxWidth = 'max-w-md',
		children,
		triggerEl = null
	} = $props();

	let dialog: HTMLDivElement,
		dialogPosition = $state({ top: 0, left: 0 });

	function updatePosition() {
		if (!triggerEl || !dialog) return;

		const triggerRect = triggerEl.getBoundingClientRect();
		const dialogRect = dialog.getBoundingClientRect();
		const viewportWidth = window.innerWidth;

		// Position above the trigger button
		let top = triggerRect.top - dialogRect.height - 8;
		let left = triggerRect.left;

		// Keep dialog within viewport
		if (top < 0) {
			// Position below if not enough space above
			top = triggerRect.bottom + 8;
		}

		// Adjust horizontal position if dialog would overflow
		if (left + dialogRect.width > window.innerWidth) {
			left = window.innerWidth - dialogRect.width - 16;
		}

		if (viewportWidth >= 1920) {
			// 4K and larger
			left = Math.min(triggerRect.left, viewportWidth * 0.4);
		} else if (viewportWidth >= 1440) {
			// MacBook Pro 14/16
			left = Math.min(triggerRect.left, 583);
		} else if (viewportWidth >= 1024) {
			// Small laptops
			left = Math.min(triggerRect.left, viewportWidth * 0.5);
		} else {
			// Tablets and mobile
			left = Math.min(triggerRect.left, viewportWidth * 0.05);
		}

		dialogPosition = { top, left };
	}

	let mutationObserver: MutationObserver;

	$effect(() => {
		if (isOpen) {
			// Watch for DOM changes that might affect page height
			mutationObserver = new MutationObserver(() => {
				updatePosition();
			});

			// Observe entire document body
			mutationObserver.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
				characterData: true
			});

			// Initial position
			updatePosition();

			// Window resize handling
			window.addEventListener('resize', updatePosition);

			return () => {
				mutationObserver?.disconnect();
				window.removeEventListener('resize', updatePosition);
			};
		}
	});

	onMount(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	});

	function handleOutsideClick(e: MouseEvent) {
		if (e.target === dialog) {
			onClose();
		}
	}
</script>

<div
	bind:this={dialog}
	class="fixed z-50 {isOpen
		? ''
		: 'hidden'} w-full {maxWidth} rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
	style="top: {dialogPosition.top}px; left: {dialogPosition.left}px;"
	onclick={handleOutsideClick}
	role="dialog"
	aria-modal="true"
	aria-hidden={!isOpen}
>
	{#if isOpen}
		<div
			class="w-full {maxWidth} rounded-lg border border-gray-200/10 bg-white/50 p-6 backdrop-blur-sm transition-all duration-300 dark:border-gray-700/10 dark:bg-gray-900/50"
			transition:fade={{ duration: SLIDE_DURATION }}
		>
			{#if title}
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{title}
					</h2>
					<button
						class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						onclick={onClose}
						aria-label="Close dialog"
					>
						<Close class="h-5 w-5" />
					</button>
				</div>
			{/if}
			{@render children()}
		</div>
	{/if}
</div>
