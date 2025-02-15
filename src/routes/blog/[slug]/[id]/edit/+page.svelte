<script lang="ts">
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import Info from '$lib/components/blog/mini/Info.svelte';
	import MarkdownEditor from '$lib/components/blog/mini/MarkdownEditor.svelte';
	import type { ITag } from '$lib/types/articles.types.js';

	let { data } = $props();

	const { article } = data;

	let container = $state<HTMLDivElement>(),
		textArea = $state<HTMLTextAreaElement>(),
		title = $state(article.title),
		foreImage = $state<string>(article.foreImage || ''),
		selectedSeries = $state(article.series?._id || ''),
		textAreaContent = $state(article.content),
		selectedTags = $state<ITag[]>(article.tags);

	$effect(() => {
		if (data.article.series) {
			selectedSeries = data.article.series._id;
		}
	});
</script>

<AnimatedContainer>
	<div class="mx-auto max-w-7xl space-y-8 pt-16">
		<h1 class="text-center text-3xl font-semibold text-gray-800 dark:text-white">Update Article</h1>

		<div class="flex gap-2 p-2" bind:this={container}>
			<AnimatedSection y={20} class="flex-1 md:w-3/4">
				<div class="p-4 transition-colors duration-300">
					<MarkdownEditor
						bind:container
						textArea={textArea as HTMLTextAreaElement}
						bind:title
						bind:textAreaContent
						bind:foreImage
						bind:selectedSeries
						bind:selectedTags
						formActionURL={`/blog/${data.article.slug}/${data.article._id}/edit`}
					/>
				</div>
			</AnimatedSection>

			<AnimatedSection y={20} class="hidden md:block md:w-1/4">
				<div class="p-1 transition-colors duration-300">
					<Info />
				</div>
			</AnimatedSection>
		</div>
	</div>
</AnimatedContainer>
