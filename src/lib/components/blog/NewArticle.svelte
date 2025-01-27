<script lang="ts">
	import Info from '$lib/components/blog/mini/Info.svelte';
	import MarkdownEditor from '$lib/components/blog/mini/MarkdownEditor.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';

	let container = $state<HTMLDivElement>(),
		title = $state(''),
		foreImage = $state(''),
		selectedSeries = $state(''),
		textAreaContent = $state(''),
		textArea = $state<HTMLTextAreaElement>();
</script>

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
				formActionURL="/blogs/create?/create"
			/>
		</div>
	</AnimatedSection>

	<AnimatedSection y={20} class="hidden md:block md:w-1/4">
		<div class="p-1 transition-colors duration-300">
			<Info />
		</div>
	</AnimatedSection>
</div>
