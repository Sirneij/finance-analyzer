<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import ThemeSwitcher from '$lib/components/resuables/ThemeSwitcher.svelte';

	let isMobile = $state(false);
	let isSidebarOpen = $state(true);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	$effect(() => {
		const checkWidth = () => {
			isMobile = window.innerWidth < 768;
			if (isMobile) isSidebarOpen = false;
		};

		checkWidth();
		window.addEventListener('resize', checkWidth);
		return () => window.removeEventListener('resize', checkWidth);
	});

	let { children } = $props();
</script>

<div class="h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
	<!-- Sidebar -->
	<Sidebar bind:isSidebarOpen {toggleSidebar} />

	<!-- Main content -->
	<div class={`h-full transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
		<header
			class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800"
		>
			<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
			<ThemeSwitcher
				class="rounded-full bg-white p-2 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-700 dark:ring-2"
			/>
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
