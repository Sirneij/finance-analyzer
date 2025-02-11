<script lang="ts">
	import { page } from '$app/state';
	import { BASE_API_URI } from '$lib/utils/contants';
	import About from '$lib/components/icons/About.svelte';
	import Behavior from '$lib/components/icons/Behavior.svelte';
	import Documentation from '$lib/components/icons/Documentation.svelte';
	import Logout from '$lib/components/icons/Logout.svelte';
	import Overview from '$lib/components/icons/Overview.svelte';
	import Transactions from '$lib/components/icons/Transactions.svelte';

	interface SidebarProps {
		isSidebarOpen: boolean;
	}

	let { isSidebarOpen, ...props }: SidebarProps = $props();

	const mainNavItems = [
		{
			href: '/finanalyzer',
			label: 'Overview',
			title: 'Overview'
		},
		{
			href: '/finanalyzer/behavior',
			label: 'Behavior',
			title: 'Behavior Analysis'
		},
		{
			href: '/finanalyzer/transactions',
			label: 'Transactions',
			title: 'Transaction History'
		},
		{
			href: '/',
			label: 'About Developer',
			title: 'About Developer'
		}
	];
	if (page.data.user && page.data.user.isJohnOwolabiIdogun) {
		mainNavItems.push({
			href: '/finanalyzer/documentation',
			label: 'Documentation',
			title: 'Documentation'
		});
	}
	const logoutItem = {
		href: `${BASE_API_URI}/v1/auth/logout`,
		label: 'Logout',
		title: 'Logout from application'
	};

	const sidebarIcons = {
		Overview: Overview,
		Behavior: Behavior,
		Transactions: Transactions,
		About: About,
		Documentation: Documentation
	};
</script>

<nav class="flex h-[calc(100vh-4rem)] flex-col justify-between px-4" {...props}>
	<!-- Main Navigation -->
	<div class="space-y-2">
		{#each mainNavItems as { href, label, title }}
			{@const Icon = sidebarIcons[label.split(' ')[0] as keyof typeof sidebarIcons]}
			<a
				{href}
				class={`flex items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
					page.url.pathname === href ? 'bg-gray-100 dark:bg-gray-700' : ''
				}`}
				{title}
			>
				<Icon class="h-6 w-6" />
				{#if isSidebarOpen}
					<span class="ml-3">{label}</span>
				{/if}
			</a>
		{/each}
	</div>

	<!-- Logout Section -->
	<div class="shrink-0">
		<div class="mb-2 h-px w-full bg-gray-200 dark:bg-gray-700"></div>
		<a
			href={logoutItem.href}
			class="group mb-4 flex items-center rounded-lg px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
			title={logoutItem.title}
		>
			<Logout class="h-6 w-6" />
			{#if isSidebarOpen}
				<span class="ml-3">{logoutItem.label}</span>
			{/if}
		</a>
	</div>
</nav>
