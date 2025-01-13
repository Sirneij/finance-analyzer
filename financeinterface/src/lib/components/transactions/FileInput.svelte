<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import Upload from '$lib/components/icons/Upload.svelte';
	import Loader from '$lib/components/resuables/Loader.svelte';

	type Data = {
		success: boolean;
		transactions: any[];
	};

	let isUploading = $state(false),
		data = $state({} as Data),
		uploadSubmitButton = $state<HTMLButtonElement>();

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const reader = new FileReader();
			reader.readAsDataURL(input.files[0]);
			if (uploadSubmitButton) uploadSubmitButton.click();
		}
	}

	const handleUpload: SubmitFunction = async () => {
		isUploading = true;
		return async ({ result }) => {
			isUploading = false;
			if (result.type === 'success' || result.type === 'redirect') {
				const res = result as any;
				data = res.data.data;
			}
			await applyAction(result);
		};
	};
</script>

<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Upload Financial Data</h2>
	<form
		class="flex w-full items-center justify-center"
		enctype="multipart/form-data"
		use:enhance={handleUpload}
		method="post"
	>
		<label
			class="group relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-indigo-500 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-indigo-400 dark:hover:bg-gray-700"
		>
			{#if isUploading}
				<Loader width={20} message="Extracting..." />
			{:else}
				<div class="flex flex-col items-center justify-center pb-6 pt-5">
					<Upload />
					<p
						class="mb-2 text-sm text-gray-500 transition-colors group-hover:text-indigo-500 dark:text-gray-400"
					>
						<span class="font-semibold">Click to upload</span> or drag and drop
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">PDF, CSV or Excel files</p>
				</div>
			{/if}
			<input
				type="file"
				name="file"
				class="hidden"
				accept=".pdf,.csv,.xlsx"
				onchange={handleFileUpload}
			/>
		</label>
		<button
			bind:this={uploadSubmitButton}
			type="submit"
			class="hidden"
			formaction="/behavior?/upload"
		>
			Upload
		</button>
	</form>
	{#if data.success}
		<p class="mt-4 text-center text-green-500 dark:text-green-400">
			Data uploaded and parsed successfully
		</p>
	{/if}
</div>
