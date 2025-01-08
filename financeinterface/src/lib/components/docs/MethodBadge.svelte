<script lang="ts">
	import type { HttpMethod } from '$lib/types/docs.types';
	export let method: HttpMethod;

	const colors = {
		GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	};
</script>

<span class="rounded-md px-2 py-1 text-xs font-medium {colors[method]}">
	{method}
</span>
