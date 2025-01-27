<script lang="ts">
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import Info from '$lib/components/blog/mini/Info.svelte';
	import MarkdownEditor from '$lib/components/blog/mini/MarkdownEditor.svelte';

	let { data } = $props();

	let container = $state<HTMLDivElement>(),
		textArea = $state<HTMLTextAreaElement>(),
		selectedSeries = $state('');

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
						bind:title={data.article.title}
						bind:textAreaContent={data.article.content}
						bind:foreImage={data.article.foreImage as string}
						bind:selectedSeries
						formActionURL={`/blogs/${data.article.slug}/${data.article._id}/edit`}
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
