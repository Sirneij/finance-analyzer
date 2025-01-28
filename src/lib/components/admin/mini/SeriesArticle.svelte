<script lang="ts">
	let { article, index } = $props();
</script>

<div
	class="group relative grid grid-cols-12 items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 hover:dark:border-gray-600 hover:dark:bg-gray-800"
>
	<!-- Index -->
	<div class="col-span-1">
		<span
			class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
		>
			{index + 1}
		</span>
	</div>

	<!-- Title -->
	<div class="col-span-5">
		<a
			href="/blogs/{article.slug}/{article._id}"
			class="font-medium text-gray-900 transition-colors hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400"
		>
			{article.title}
		</a>
	</div>

	<!-- Created Date -->
	<div class="col-span-2 text-sm text-gray-500 dark:text-gray-400">
		{new Date(article.createdAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})}
	</div>

	<!-- Updated Date -->
	<div class="col-span-2 text-sm text-gray-500 dark:text-gray-400">
		{new Date(article.updatedAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})}
	</div>

	<!-- Status Badge -->
	<div class="col-span-2 text-right">
		<span
			class={`rounded-full px-2.5 py-1 text-xs font-medium ${
				article.isPublished
					? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
					: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
			}`}
		>
			{article.isPublished ? 'Published' : 'Draft'}
		</span>
	</div>
</div>
