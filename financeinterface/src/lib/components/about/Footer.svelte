<script lang="ts">
	import Hearts from '$lib/components/icons/Hearts.svelte';

	const currentYear = new Date().getFullYear();
</script>

<footer class="mt-24 w-full border-t border-gray-200 py-8 dark:border-gray-700">
	<div class="mx-auto max-w-4xl px-4">
		<div
			class="flex flex-col items-center justify-center space-y-2 text-sm text-gray-600 dark:text-gray-400"
		>
			<p class="flex items-center justify-center space-x-1">
				&copy; {currentYear} John Owolabi Idogun. All rights reserved <Hearts
					class=" h-4 w-4 text-red-500 dark:text-red-400"
				/>.
			</p>
			<p class="text-center">
				Built from scratch with Svelte 5 (SvelteKit), NodeJS, Python and TailwindCSS.
			</p>
		</div>
	</div>
</footer>
