<script lang="ts">
	let { article } = $props();
	let imageLoaded = $state(false),
		imageError = $state(false);

	const placeholderImage =
		article.blurHash ||
		'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDARAVFhgYGBgdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

	function handleImageError() {
		imageError = true;
	}

	function handleImageLoad() {
		imageLoaded = true;
	}
</script>

<figure class="relative">
	<div class="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
		<!-- Blur hash placeholder -->
		<div
			class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300"
			class:opacity-0={imageLoaded}
			style="background-image: url('{placeholderImage}')"
			aria-hidden="true"
		></div>

		<!-- Main image -->
		{#if !imageError}
			<img
				src={article.foreImage}
				alt={article.title}
				class="relative w-full transition-transform duration-300 hover:scale-110"
				class:opacity-0={!imageLoaded}
				class:scale-105={imageLoaded}
				loading="lazy"
				width={1000}
				height={420}
				itemprop="image"
				style="aspect-ratio: auto 1000 / 420;"
				onerror={handleImageError}
				onload={handleImageLoad}
				decoding="async"
				fetchpriority="high"
			/>
		{:else}
			<!-- Fallback for failed images -->
			<div
				class="flex aspect-[1000/420] items-center justify-center bg-gray-100 dark:bg-gray-800"
				role="img"
				aria-label={article.title}
			>
				<span class="text-sm text-gray-500 dark:text-gray-400">Image unavailable</span>
			</div>
		{/if}
	</div>

	<!-- Optional caption -->
	<!-- {#if article.title}
		<figcaption class="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">
			{article.title}
		</figcaption>
	{/if} -->
</figure>
