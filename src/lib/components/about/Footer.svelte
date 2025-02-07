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
			<p class="flex items-center justify-center space-x-1">
				<span>&copy; {currentYear}</span>
				<span>John Owolabi Idogun. All rights reserved.</span>
			</p>
			<small class="flex flex-wrap items-center justify-center gap-1 text-center">
				<span>Built with</span>
				<Hearts class="h-3 w-3 text-red-500 md:h-4 md:w-4 dark:text-red-400" />
				<span>from scratch with</span>
				<span class="flex flex-wrap items-center justify-center gap-1">
					<span>Svelte 5,</span>
					<span>NodeJS,</span>
					<span>Python</span>
					<span>and</span>
					<span>TailwindCSS.</span>
				</span>
			</small>
		</div>
	</div>
</footer>
