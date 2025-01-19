<script lang="ts">
	import { page } from '$app/state';
	import ThemeSwitcher from '$lib/components/resuables/ThemeSwitcher.svelte';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import { fly } from 'svelte/transition';
	import { dev } from '$app/environment';

	interface ErrorInfo {
		title: string;
		message: string;
		animation: string;
		iconPath: string;
	}

	interface ErrorWithStack extends Error {
		stack?: string;
	}

	// Define valid status codes type
	type StatusCode = 401 | 403 | 404 | 500 | 502 | 503;

	// Map status codes to friendly messages and animations
	const errorMap: Record<StatusCode, ErrorInfo> = {
		401: {
			title: 'Unauthorized',
			message: 'Please login to access this resource.',
			animation: 'scale-95',
			iconPath:
				'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
		},
		403: {
			title: 'Forbidden',
			message: "You don't have permission to access this resource.",
			animation: 'rotate-6',
			iconPath:
				'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
		},
		404: {
			title: 'Page Not Found',
			message: `The page you're looking for doesn't exist or has been moved.`,
			animation: 'translate-y-4',
			iconPath: 'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		},
		500: {
			title: 'Server Error',
			message: 'Something went wrong on our end. Please try again later.',
			animation: 'rotate-12',
			iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		},
		502: {
			title: 'Bad Gateway',
			message: 'The server received an invalid response.',
			animation: 'scale-95',
			iconPath: 'M13 10V3L4 14h7v7l9-11h-7z'
		},
		503: {
			title: 'Service Unavailable',
			message: 'The service is temporarily unavailable.',
			animation: 'rotate-3',
			iconPath:
				'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		}
	};

	const status = page.status;
	const error: ErrorInfo = errorMap[status as StatusCode] || {
		title: 'Unexpected Error',
		message: 'An unexpected error occurred.',
		animation: 'scale-95',
		iconPath:
			'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
	};

	const err = $derived(page.error as ErrorWithStack);

	// Log the real error to the console

	$inspect(err, 'error');
</script>

<div
	class="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
>
	<ThemeSwitcher
		class="fixed right-4 top-4 z-50 cursor-pointer rounded-full bg-white p-2 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-700 dark:ring-2"
	/>

	<AnimatedContainer class="flex min-h-screen items-center justify-center p-4">
		<AnimatedSection y={20} class="w-full max-w-lg text-center">
			<div
				in:fly={{ y: 20, duration: 600 }}
				class="rounded-xl bg-white p-8 shadow-xl dark:bg-gray-800"
			>
				<!-- Error Icon -->
				<div class="mx-auto mb-6 h-24 w-24">
					<div
						class={`animate-bounce rounded-full bg-red-100 p-4 dark:bg-red-900/50 ${error.animation}`}
					>
						<svg
							class="h-16 w-16 text-red-600 dark:text-red-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d={error.iconPath}
							/>
						</svg>
					</div>
				</div>

				<!-- Error Status -->
				<h1
					class="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-6xl font-bold text-transparent dark:from-red-400 dark:to-pink-400"
				>
					{status}
				</h1>

				<!-- Error Title -->
				<h2 class="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">
					{error.title}
				</h2>

				<!-- Error Message -->
				<p class="mt-2 text-gray-600 dark:text-gray-300">
					{error.message}
				</p>

				<!-- Back Button -->
				<a
					href="/"
					class="mt-8 inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:from-indigo-400 dark:to-purple-400"
				>
					<svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Back to Home
				</a>
			</div>
			{#if dev && err}
				<div class="mt-8 text-left">
					<details class="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
						<summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
							Show Debug Information
						</summary>
						<div class="mt-2">
							<pre
								class="overflow-x-auto rounded bg-gray-100 p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                <code>
                                    {JSON.stringify(err, null, 2)}
                                </code>
                            </pre>
							{#if err?.stack}
								<div class="mt-4">
									<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Stack Trace:</h3>
									<pre
										class="mt-2 overflow-x-auto rounded bg-gray-100 p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                        <code>
                                            {err.stack}
                                        </code>
                                    </pre>
								</div>
							{/if}
						</div>
					</details>
				</div>
			{/if}
		</AnimatedSection>
	</AnimatedContainer>
</div>
