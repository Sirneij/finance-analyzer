<script lang="ts">
	import { page } from '$app/state';
	import { BASE_API_URI } from '$lib/utils/contants';

	interface SidebarProps {
		isSidebarOpen: boolean;
	}

	let { isSidebarOpen, ...props }: SidebarProps = $props();

	const mainNavItems = [
		{
			href: '/finanalyzer',
			label: 'Overview',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`,
			title: 'Overview'
		},
		{
			href: '/finanalyzer/behavior',
			label: 'Behavior',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />`,
			title: 'Behavior Analysis'
		},
		{
			href: '/finanalyzer/transactions',
			label: 'Transactions',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />`,
			title: 'Transaction History'
		},
		// {
		// 	href: '/finanalyzer/settings',
		// 	label: 'Settings',
		// 	icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
		// <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`,
		// 	title: 'Account Settings'
		// },
		{
			href: '/',
			label: 'About Developer',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />`,
			title: 'About Developer'
		}
	];
	if (page.data.user && page.data.user.isJohnOwolabiIdogun) {
		mainNavItems.push({
			href: '/finanalyzer/documentation',
			label: 'Documentation',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />`,
			title: 'Documentation'
		});
	}
	const logoutItem = {
		href: `${BASE_API_URI}/v1/auth/logout`,
		label: 'Logout',
		icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />`,
		title: 'Logout from application'
	};
</script>

<nav class="flex h-[calc(100vh-4rem)] flex-col justify-between px-4">
	<!-- Main Navigation -->
	<div class="space-y-2">
		{#each mainNavItems as { href, label, icon, title }}
			<a
				{href}
				class={`flex items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
					page.url.pathname === href ? 'bg-gray-100 dark:bg-gray-700' : ''
				}`}
				{title}
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					{@html icon}
				</svg>
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
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				{@html logoutItem.icon}
			</svg>
			{#if isSidebarOpen}
				<span class="ml-3">{logoutItem.label}</span>
			{/if}
		</a>
	</div>
</nav>
