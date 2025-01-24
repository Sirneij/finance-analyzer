<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Notifications from '$lib/components/reusables/Notifications.svelte';
	import ThemeSwitcher from '$lib/components/reusables/ThemeSwitcher.svelte';

	let isMobile = $state(false),
		isSidebarOpen = $state(true),
		innerWidth = $state(0);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	const checkWidth = () => {
		isMobile = innerWidth < 768;
		if (isMobile) isSidebarOpen = false;
	};

	let { children } = $props();
</script>

<svelte:window on:resize={checkWidth} bind:innerWidth />

<div class="relative h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
	<Notifications />
	<!-- Sidebar -->
	<Sidebar bind:isSidebarOpen {toggleSidebar} />

	<!-- Main content -->
	<div
		class="{`relative h-full transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'} ${isMobile && isSidebarOpen ? 'translate-x-64' : 'translate-x-0'}`}}"
	>
		<header
			class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800"
		>
			<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
			<ThemeSwitcher
				class="rounded-full bg-white p-2 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-700 dark:ring-2"
			></ThemeSwitcher>
		</header>

		<main class="h-[calc(100vh-4rem)] overflow-y-auto p-6">
			{@render children()}
		</main>
	</div>

	<!-- Mobile Overlay -->
	{#if isMobile && isSidebarOpen}
		<button
			class="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm"
			onclick={() => (isSidebarOpen = false)}
			aria-label="Close Sidebar"
		></button>
	{/if}
</div>
