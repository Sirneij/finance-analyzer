<script lang="ts">
	import SidebarNav from '$lib/components/layout/SidebarNav.svelte';
	import Logo from '$lib/components/logos/Logo.svelte';

	type SidebarProps = {
		isSidebarOpen: boolean;
		toggleSidebar: () => void;
	};

	let { isSidebarOpen = $bindable(), toggleSidebar, ...props }: SidebarProps = $props();

	let isSmall = $state(false);

	$effect(() => {
		isSmall = !isSidebarOpen;
	});
</script>

<aside
	class:w-64={isSidebarOpen}
	class:w-20={!isSidebarOpen}
	class="fixed inset-y-0 left-0 z-30 transform bg-white transition-all duration-300 dark:bg-gray-800"
>
	<div class="flex h-16 items-center justify-between px-4">
		<a class="logo-container" href="/finanalyzer">
			{#if isSidebarOpen}
				<Logo {isSmall} class="h-12 w-auto" />
			{:else}
				<Logo {isSmall} class="h-8 w-auto" />
			{/if}
		</a>
		<button
			onclick={toggleSidebar}
			class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
			aria-label="Toggle sidebar"
		>
			<svg class="h-6 w-6 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none">
				<path
					stroke="currentColor"
					stroke-width="2"
					d={isSidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 19l7-7-7-7'}
				/>
			</svg>
		</button>
	</div>

	<SidebarNav {isSidebarOpen} />
</aside>

<style>
	.logo-container {
		display: flex;
		align-items: center;
	}
</style>
