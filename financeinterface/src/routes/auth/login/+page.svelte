<script lang="ts">
	import { page } from '$app/state';
	import AiNode from '$lib/components/icons/AINode.svelte';
	import Calculator from '$lib/components/icons/Calculator.svelte';
	import FinChart from '$lib/components/icons/FinChart.svelte';
	import GitHub from '$lib/components/icons/GitHub.svelte';
	import Google from '$lib/components/icons/Google.svelte';
	import Logo from '$lib/components/logos/Logo.svelte';
	import ThemeSwitcher from '$lib/components/resuables/ThemeSwitcher.svelte';
	import { BASE_API_URI } from '$lib/utils/contants';
	import { fade } from 'svelte/transition';

	const next = page.url.searchParams.get('next') || '/';
</script>

<div
	class="relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800"
>
	<!-- Theme Toggle -->
	<ThemeSwitcher
		class="dark:ring-black-500/50 absolute right-4 top-4 z-50 cursor-pointer rounded-full bg-white p-2 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-700 dark:ring-2"
	/>

	<!-- Decorative background elements -->
	<div class="absolute inset-0 z-0 overflow-hidden">
		<!-- AI Network Nodes -->
		<div class="floating-icons absolute left-10 top-10 opacity-20 dark:opacity-30">
			<AiNode />
		</div>
		<!-- Financial Chart -->
		<div class="floating-icons absolute bottom-32 right-20 opacity-20 dark:opacity-30">
			<FinChart />
		</div>
		<!-- Calculator Icon -->
		<div class="floating-icons absolute right-10 top-20 opacity-20 dark:opacity-30">
			<Calculator />
		</div>
	</div>

	<!-- Main content -->
	<div class="relative z-10 flex min-h-screen items-center justify-center">
		<div
			in:fade={{ duration: 300 }}
			class="w-full max-w-md space-y-8 rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 dark:bg-gray-800/90 dark:shadow-gray-900/30"
		>
			<!-- Logo -->
			<div class="logo-container flex justify-center">
				<Logo isSmall={false} class="h-12 w-auto" />
			</div>
			<!-- Header -->
			<div class="text-center">
				<h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back</h2>
				<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
					Sign in to continue to your account
				</p>
				{#if page.url.searchParams.get('error')}
					<p class="mt-2 text-sm text-red-500 dark:text-red-400">
						Log in failed. Please try again.
					</p>
				{/if}
			</div>

			<!-- Social Login Buttons -->
			<div class="mt-8 space-y-4">
				<!-- Google Login Button -->
				<a
					href="/auth/google"
					class="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				>
					<Google />
					Continue with Google
				</a>
				<!-- GitHub Login Button -->
				<a
					href={`${BASE_API_URI}/v1/auth/github?next=${next}`}
					class="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				>
					<GitHub />
					Continue with GitHub
				</a>
			</div>

			<!-- Divider -->
			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
							Policy Agreement
						</span>
					</div>
				</div>
			</div>
			<!-- Additional Info -->
			<div class="mt-6 text-center text-sm">
				<p class="text-gray-600 dark:text-gray-400">
					By continuing, you agree to our
					<a
						href="/terms"
						class="font-medium text-indigo-600 transition-colors duration-300 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
					>
						Terms of Service
					</a>
					and
					<a
						href="/privacy"
						class="font-medium text-indigo-600 transition-colors duration-300 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
					>
						Privacy Policy
					</a>
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.floating-icons {
		animation: float 6s ease-in-out infinite;
	}
	.floating-icons:nth-child(2) {
		animation-delay: 2s;
	}
	.floating-icons:nth-child(3) {
		animation-delay: 4s;
	}
	@keyframes float {
		0% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(360deg);
		}
		100% {
			transform: translateY(0px) rotate(0deg);
		}
	}
</style>
