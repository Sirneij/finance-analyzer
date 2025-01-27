<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import Loader from '$lib/components/reusables/Loader.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	type Props = {
		foreImage: string;
	};
	let { foreImage = $bindable() }: Props = $props();
	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const reader = new FileReader();

			reader.readAsDataURL(input.files[0]);

			if (submitButton) submitButton.click();
		}
	}

	let isUploading = $state(false),
		submitButton = $state<HTMLButtonElement>(),
		fileInput = $state<HTMLInputElement>();

	function triggerFileInput() {
		if (fileInput) fileInput.click();
		foreImage = '';
	}

	const handleUpload: SubmitFunction = async () => {
		isUploading = true;
		return async ({ result }) => {
			isUploading = false;
			if (result.type === 'success' || result.type === 'redirect') {
				const res = result as any;

				if (res.data.uploadResult) {
					foreImage = res.data.uploadResult.secure_url;
				}
				if (res.data.delete && fileInput) {
					fileInput.value = '';
					foreImage = '';
				}
			}
			await applyAction(result);
		};
	};
</script>

<form enctype="multipart/form-data" use:enhance={handleUpload} method="post">
	<div class="flex items-center space-x-6">
		{#if foreImage}
			<img src={foreImage} alt="Cover" width="100" height="40" />
			<div class="flex space-x-2">
				<button
					type="button"
					onclick={triggerFileInput}
					class="rounded bg-gray-100 px-4 py-1 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				>
					Change
					<span
						class="pointer-events-none absolute -left-0 top-10 rounded bg-inherit p-1 text-sm font-medium text-gray-500 opacity-0 shadow transition-opacity group-hover:opacity-100 dark:text-white"
					>
						<span class="text-xs">Use quality image for best results...</span>
					</span>
				</button>

				<input type="hidden" name="foreimage" value={foreImage} required />
				{#if isUploading}
					<Loader width={20} message="Removing..." />
				{:else}
					<button
						type="submit"
						class="rounded px-4 py-1 text-sm font-medium text-rose-600 transition-all hover:bg-gray-100 dark:text-rose-400 dark:hover:bg-gray-700"
						formaction="/blogs?/deleteUpload"
					>
						Remove
					</button>
				{/if}
			</div>
		{:else}
			<div class="flex space-x-2">
				{#if isUploading}
					<Loader width={20} message="Uploading..." />
				{:else}
					<button
						type="button"
						onclick={triggerFileInput}
						class="group relative rounded bg-gray-100 px-6 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
					>
						Add a cover image
						<span
							class="pointer-events-none absolute -left-4 top-10 z-50 w-48 rounded bg-gray-800 p-2 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 dark:bg-gray-700"
						>
							Ideal dimensions: 1000x420 pixels
						</span>
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
		/>
		<button bind:this={submitButton} type="submit" class="hidden" formaction="/blogs?/upload">
			Upload
		</button>
	</div>
</form>
