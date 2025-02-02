<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import Caret from '$lib/components/icons/Caret.svelte';
	import Check from '$lib/components/icons/Check.svelte';
	import Note from '$lib/components/icons/editor/Note.svelte';
	import Loader from '$lib/components/reusables/Loader.svelte';
	import Tooltip from '$lib/components/reusables/Tooltip.svelte';
	import { fetchSeriesArticles } from '$lib/utils/helpers/editor/blogs.helpers';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { fade, slide } from 'svelte/transition';

	type Props = {
		foreImage: string;
		selectedSeries: string;
	};
	let { foreImage = $bindable(), selectedSeries = '' }: Props = $props();

	let isUploading = $state(false),
		submitButton = $state<HTMLButtonElement>(),
		fileInput = $state<HTMLInputElement>(),
		seriesImages = $state<{ url: string; title: string }[]>([]),
		isSeriesImagesOpen = $state(false),
		showSeriesNote = $state(true),
		selectedImageUrl = $state('');

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const reader = new FileReader();

			reader.readAsDataURL(input.files[0]);

			if (submitButton) submitButton.click();
		}
	}

	function triggerFileInput() {
		if (fileInput) fileInput.click();
		foreImage = '';
	}

	// Fetch series images when selectedSeries changes
	$effect(() => {
		if (selectedSeries) {
			fetchSeriesImages(selectedSeries);
		}
		selectedImageUrl = foreImage;
	});

	async function fetchSeriesImages(seriesId: string) {
		try {
			const articles = await fetchSeriesArticles(seriesId);
			seriesImages = articles
				.filter((article) => article.foreImage)
				.map((article) => ({
					url: article.foreImage!,
					title: article.title
				}))
				.filter((image, index, self) => self.findIndex((i) => i.url === image.url) === index);
		} catch (error) {
			console.error('Failed to fetch series images:', error);
		}
	}

	function useSeriesImage(imageUrl: string) {
		foreImage = imageUrl;
	}

	const handleUpload: SubmitFunction = async () => {
		isUploading = true;
		return async ({ result, update }) => {
			isUploading = false;
			if (result.type === 'success' || result.type === 'redirect') {
				const res = result as any;

				if (res.data.uploadResult) {
					foreImage = res.data.uploadResult.secure_url;
				}
				if (res.data.delete) {
					foreImage = '';
					if (fileInput) fileInput.value = '';
				}
				await update();
			}
			await applyAction(result);
		};
	};
</script>

<form enctype="multipart/form-data" use:enhance={handleUpload} method="post">
	{#if !selectedSeries && showSeriesNote}
		<div
			class="mb-4 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-sm dark:border-blue-800/30 dark:bg-blue-900/10"
			transition:fade
		>
			<Note class="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
			<div class="flex-1">
				<p class="font-medium text-blue-800 dark:text-blue-300">Pro tip:</p>
				<p class="mt-1 text-blue-700/90 dark:text-blue-400/90">
					If your article is part of a series, select it first from the Post Options (⚙️) to reuse
					images from existing articles.
				</p>
			</div>
			<button
				type="button"
				class="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
				onclick={() => (showSeriesNote = false)}
				aria-label="Dismiss note"
			>
				×
			</button>
		</div>
	{/if}
	{#if selectedSeries && seriesImages.length > 0}
		<div class="mb-2">
			<button
				type="button"
				class="flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-2 dark:bg-gray-800"
				onclick={() => (isSeriesImagesOpen = !isSeriesImagesOpen)}
			>
				<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Series Images</h4>
				<Caret
					class="h-5 w-5 transform text-gray-800 transition-transform dark:text-white {isSeriesImagesOpen
						? 'rotate-180'
						: ''}"
					trend="down"
				/>
			</button>

			{#if isSeriesImagesOpen}
				<div class="mt-2" transition:slide>
					<div class="grid grid-cols-3 gap-4">
						{#each seriesImages as image}
							<button
								type="button"
								class="relative rounded-lg border-2 {selectedImageUrl === image.url
									? 'border-indigo-500'
									: 'border-transparent hover:border-indigo-500/50'}"
								onclick={() => useSeriesImage(image.url)}
							>
								<img
									src={image.url}
									alt={image.title}
									class="h-28 w-full rounded-lg object-cover"
									loading="lazy"
								/>
								{#if selectedImageUrl === image.url}
									<div
										class="absolute inset-0 flex items-center justify-center rounded-lg bg-indigo-500/10"
									>
										<Check class="h-6 w-6 text-indigo-500" />
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<div class="flex items-center space-x-6">
		{#if foreImage}
			<div class="group relative h-36 w-72">
				<img src={foreImage} alt="Cover" class="h-full w-full rounded-lg object-cover" />
				<div
					class="backdrop-blur-xs absolute inset-0 flex items-center justify-center gap-4 rounded-lg bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
				>
					<button
						type="button"
						onclick={triggerFileInput}
						class="btn-primary relative px-6 py-2 text-base"
						disabled={isUploading}
					>
						Change
						<Tooltip text="Recommended dimensions: 1000x420 pixels" />
					</button>

					<input type="hidden" name="foreimage" value={foreImage} required />

					{#if isUploading}
						<Loader width={24} message="Removing..." />
					{:else}
						<button
							type="submit"
							class="btn-danger px-6 py-2 text-base"
							formaction="/blogs?/deleteUpload"
							disabled={isUploading}
						>
							Remove
						</button>
					{/if}
				</div>
			</div>
		{:else}
			<div class="flex space-x-2">
				{#if isUploading}
					<Loader width={20} message="Uploading..." />
				{:else}
					<button
						type="button"
						onclick={triggerFileInput}
						class="btn-primary group relative"
						disabled={isUploading}
					>
						Add a cover image
						<Tooltip text="Ideal dimensions: 1000x420 pixels" />
					</button>
				{/if}
			</div>
		{/if}

		<input
			type="file"
			name="file"
			bind:this={fileInput}
			accept="image/*"
			class="hidden"
			onchange={handleFileChange}
			aria-label="Upload cover image"
		/>

		<button
			bind:this={submitButton}
			type="submit"
			class="hidden"
			formaction="/blogs?/upload"
			aria-hidden="true"
		>
			Upload
		</button>
	</div>
</form>
