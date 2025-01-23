<script lang="ts">
	import { showInfo } from '$lib/utils/helpers/editor/markdown.helpers';

	let {
		container = $bindable(),
		title = $bindable()
	}: { container: HTMLDivElement; title: string } = $props();
</script>

<label for="title" class="sr-only">Post title</label>
<input
	id="title"
	name="title"
	type="text"
	bind:value={title}
	use:showInfo={{ container: container, infoId: 'title-info' }}
	class="h-28 w-full bg-inherit px-0 text-6xl text-gray-800 dark:text-white dark:placeholder-gray-400"
	placeholder="New post title here..."
	autocomplete="off"
/>
