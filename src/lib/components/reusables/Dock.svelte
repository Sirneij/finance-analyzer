<script lang="ts">
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import { fly, scale } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import Collapse from '$lib/components/icons/Collapse.svelte';
	import { page } from '$app/state';
	import WriteStar from '$lib/components/icons/WriteStar.svelte';
	import ShieldStar from '$lib/components/icons/ShieldStar.svelte';
	import type { Snippet } from 'svelte';

	let {
		title = 'Filters',
		children
	}: {
		title?: string;
		children?: Snippet;
	} = $props();
	let isExpanded = $state(false);
</script>

<div class="fixed left-0 top-1/2 z-50 -translate-y-1/2">
	{#if !isExpanded}
		<button
			onclick={() => (isExpanded = true)}
			aria-label="Open {title}"
			title="Open {title}"
			in:scale={{ duration: 200, easing: elasticOut }}
			class="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-r-lg bg-white/90 shadow-lg backdrop-blur-sm transition-[transform,background,shadow] duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-xl dark:bg-gray-800/90 dark:hover:bg-gray-700"
		>
			<Collapse
				class="h-5 w-5 text-gray-900 transition-transform duration-300 
			hover:scale-110 dark:text-gray-100"
				collapse={false}
			/>
		</button>
	{:else}
		<div
			in:fly={{ x: -300, duration: SLIDE_DURATION, easing: elasticOut }}
			out:fly={{ x: -300, duration: SLIDE_DURATION, easing: elasticOut }}
			class="max-w-64 rounded-r-lg bg-white/90 shadow-xl backdrop-blur-sm
                transition-all duration-300 hover:shadow-2xl dark:bg-gray-800/90"
		>
			<div class="max-h-[80vh] overflow-y-auto p-4">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="mr-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
						{title}
					</h2>
					<button
						onclick={() => (isExpanded = false)}
						aria-label="Close {title}"
						title="Close {title}"
						class="rounded p-1 transition-all duration-300 hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						<Collapse
							class="h-5 w-5 text-gray-900 transition-transform duration-300 hover:-translate-x-1 dark:text-gray-100"
						/>
					</button>
				</div>

				<div class="space-y-4">
					{#if page.data.user && page.data.user.isJohnOwolabiIdogun}
						<ul class="flex flex-col space-y-4">
							<li>
								<a
									href="/blogs/create"
									class="flex flex-col items-center space-y-1
									{page.url.pathname === '/blogs/create'
										? 'text-indigo-500'
										: 'text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400'}"
								>
									<WriteStar class="h-6 w-6" />
									<span class="text-xs">Write</span>
								</a>
							</li>
							<li>
								<a
									href="/blogs/admin"
									class="flex flex-col items-center space-y-1
									{page.url.pathname === '/blogs/admin'
										? 'text-indigo-500'
										: 'text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400'}"
								>
									<ShieldStar class="h-6 w-6" />
									<span class="text-xs">Manage</span>
								</a>
							</li>
						</ul>
					{/if}
					{#if children}
						<hr class="border-gray-200 dark:border-gray-700" />
						<div class="transition-all duration-300 hover:translate-x-1">
							{@render children()}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
