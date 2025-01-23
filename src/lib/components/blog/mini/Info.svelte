<script lang="ts">
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import { fade } from 'svelte/transition';
</script>

<div
	id="info"
	class="sticky top-4 hidden h-[calc(100vh-6rem)] overflow-auto text-gray-800 dark:text-white"
>
	<div
		id="title-info"
		class="hidden"
		aria-labelledby="title-info"
		aria-hidden="true"
		transition:fade={{ duration: SLIDE_DURATION }}
	>
		<h2 class="text-lg font-bold">Writing a Great Post Title</h2>
		<ul role="list" class="list-disc space-y-3 pl-5 marker:text-gray-500">
			<li>
				Think of your post title as a super short (but compelling!) description — like an overview
				of the actual post in one short sentence.
			</li>
			<li>Use keywords where appropriate to help ensure people can find your post by search.</li>
		</ul>
	</div>

	<div
		id="tags-info"
		class="hidden"
		aria-labelledby="tags-info"
		aria-hidden="true"
		transition:fade={{ duration: SLIDE_DURATION }}
	>
		<h2 class="text-lg font-bold">Adding Tags</h2>
		<ul role="list" class="list-disc space-y-3 pl-5 marker:text-gray-500">
			<li>Tags help others find your post and are a great way to browse content.</li>
			<li>Choose up to 4 tags that best describe your post. At least 1 tag is required.</li>
			<li>
				You can also add tags by typing in the input field. Press Enter, type a comma, or click on a
				tag to add it.
			</li>
		</ul>
	</div>
	<div
		id="editor-info"
		class="hidden"
		aria-labelledby="editor-info"
		aria-hidden="true"
		transition:fade={{ duration: SLIDE_DURATION }}
	>
		<h2 class="text-lg font-bold">Editor Basics</h2>
		<ul role="list" class="list-disc space-y-3 pl-5 marker:text-gray-500">
			<li>
				Use <a
					target="_blank"
					href="https://www.markdownguide.org/extended-syntax/"
					class="text-teal-500 hover:underline"
				>
					Markdown
				</a>
				to write and format posts.
				<details class="cursor-pointer">
					<summary class="text-sm font-medium">Commonly used syntax</summary>
					<!-- Use table -->
					<table
						class="w-full table-auto border-collapse border border-gray-200 shadow-lg dark:border-gray-700"
					>
						<tbody>
							<tr class="border-b bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
								<td class="p-2 text-left font-semibold text-gray-900 dark:text-gray-100"
									>###### Header</td
								>
								<td class="p-2 text-left text-gray-900 dark:text-gray-100">H1 Header</td>
							</tr>
							<tr class="border-b bg-white dark:border-gray-600 dark:bg-gray-700">
								<td class="p-2 text-left text-gray-900 dark:text-gray-100"
									><i>*italics* or _italics_</i></td
								>
								<td class="p-2 text-left text-gray-900 dark:text-gray-100"><i>italics</i></td>
							</tr>
							<tr class="border-b bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
								<td class="p-2 text-left text-gray-900 dark:text-gray-100"><code>**bold**</code></td
								>
								<td class="p-2 text-left text-gray-900 dark:text-gray-100"><strong>bold</strong></td
								>
							</tr>
							<tr class="border-b bg-white dark:border-gray-600 dark:bg-gray-700">
								<td class="p-2 text-left text-gray-900 dark:text-gray-100"
									><code>[Link](https://...)</code></td
								>
								<td class="p-2 text-left text-gray-900 dark:text-gray-100">Link</td>
							</tr>
							<tr class="border-b bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
								<td class="p-2 text-left text-gray-900 dark:text-gray-100">
									<ul class="list-disc pl-4">
										<li>item 1</li>
									</ul>
								</td>
								<td class="p-2 text-left text-gray-900 dark:text-gray-100">* item 1</td>
							</tr>
							<tr class="border-b bg-white dark:border-gray-600 dark:bg-gray-700">
								<td class="p-2 text-left text-gray-900 dark:text-gray-100">
									<ol class="list-decimal pl-4">
										<li>item 1</li>
									</ol>
								</td>
								<td class="p-2 text-left text-gray-900 dark:text-gray-100">1. item 1</td>
							</tr>
							<tr class="border-b bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
								<td class="p-2 text-left text-gray-900 dark:text-gray-100">&gt; quoted text</td>
								<td class="p-2 text-left text-gray-900 dark:text-gray-100">quoted text</td>
							</tr>
							<tr class="border-b bg-white dark:border-gray-600 dark:bg-gray-700">
								<td class="p-2 text-left text-gray-900 dark:text-gray-100"
									><code>`inline code`</code></td
								>
								<td class="p-2 text-left text-gray-900 dark:text-gray-100">inline code</td>
							</tr>
							<tr class="border-b bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
								<td class="p-2 text-left text-gray-900 dark:text-gray-100"><code>```</code></td>
								<td class="p-2 text-left text-gray-900 dark:text-gray-100">code block</td>
							</tr>
							<tr class="border-b bg-white dark:border-gray-600 dark:bg-gray-700">
								<td class="p-2 text-left text-gray-900 dark:text-gray-100"
									><code>![alt text](https://...)</code></td
								>
								<td class="p-2 text-left text-gray-900 dark:text-gray-100">image</td>
							</tr>
						</tbody>
					</table>
				</details>
			</li>
			<li>
				For code blocks, you can specify the language, filename, line numbers that need emphasis,
				and whether or not the code can be run.
			</li>
			<li>
				Embed github repositories using the following syntax:
				<pre><code>&#123;% github username/repo %&#125;</code></pre>
			</li>
		</ul>
	</div>
</div>
