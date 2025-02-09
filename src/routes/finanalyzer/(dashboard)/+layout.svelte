<script lang="ts">
	import Collapse from '$lib/components/icons/Collapse.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import ThemeSwitcher from '$lib/components/reusables/ThemeSwitcher.svelte';

	let isMobile = $state(false),
		isSidebarOpen = $state(true),
		innerWidth = $state(0);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	const checkWidth = () => {
		const wasMobile = isMobile;
		isMobile = innerWidth < 768;

		// Handle transition between mobile and desktop
		if (wasMobile !== isMobile) {
			if (isMobile) {
				isSidebarOpen = false;
			} else {
				isSidebarOpen = true;
			}
		}
	};

	let { children } = $props();

	$effect(() => {
		checkWidth();
	});
</script>

<svelte:window on:resize={checkWidth} bind:innerWidth />

<div class="relative h-screen overflow-hidden bg-gray-100 dark:bg-gray-900" id="main-content">
	<!-- Sidebar -->
	<Sidebar bind:isSidebarOpen bind:isMobile {toggleSidebar} />

	<!-- Main content -->
	<div
		class="relative h-full transform transition-all duration-300 md:translate-x-0"
		class:margin-left-64={isSidebarOpen}
		class:margin-left-20={!isSidebarOpen}
		class:overflow-hidden={isMobile && isSidebarOpen}
	>
		<header
			class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex items-center gap-4">
				<!-- Mobile menu button -->
				<button
					class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-gray-700"
					onclick={toggleSidebar}
					aria-label="Toggle Menu"
				>
					<Collapse class="h-6 w-6" collapse={false} />
				</button>
				<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
			</div>
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
			class="backdrop-blur-xs fixed inset-0 z-20 bg-gray-900/50"
			onclick={() => (isSidebarOpen = false)}
			aria-label="Close Sidebar"
		></button>
	{/if}
</div>
