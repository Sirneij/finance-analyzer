<script>
	import Hearts from '$lib/components/icons/Hearts.svelte';

	const currentYear = new Date().getFullYear();
</script>

<footer
	class="mt-24 w-full border-t border-gray-200 py-6 sm:py-8 dark:border-gray-700"
	aria-label="Site footer"
>
	<div class="mx-auto max-w-4xl px-4">
		<div
			class="flex flex-col items-center justify-center space-y-3 text-sm text-gray-600 dark:text-gray-400"
		>
			<small class="flex items-center justify-center space-x-1">
				<span>&copy; {currentYear}</span>
				<span>John Owolabi Idogun. All rights reserved.</span>
			</small>
			<p class="flex items-center text-center text-sm">
				Built with
				<Hearts class="mx-1 h-4 w-4 text-red-500 dark:text-red-400" />
				from scratch with Svelte 5, NodeJS, Python and TailwindCSS.
			</p>
		</div>
	</div>
</footer>
