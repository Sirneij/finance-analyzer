<script lang="ts">
	import { loadingManager } from '$lib/states/loading.svelte';
</script>

{#if loadingManager.visible}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm dark:bg-gray-900/90"
	>
		<div class="w-[600px] rounded-lg bg-white shadow-xl dark:bg-gray-800">
			<div class="flex items-center space-x-2 border-b border-gray-200 p-4 dark:border-gray-700">
				<div class="h-3 w-3 rounded-full bg-red-500"></div>
				<div class="h-3 w-3 rounded-full bg-yellow-500"></div>
				<div class="h-3 w-3 rounded-full bg-green-500"></div>
			</div>
			<div class="code-container p-4 font-mono text-sm">
				<div class="line comment">{`/** Personal blogging Tool */`}</div>
				<div class="line">
					<span class="keyword">async function</span>
					<span class="function">fetchData</span>
					<span class="punctuation">()</span>
					<span class="punctuation">{`{`}</span>
				</div>
				<div class="line indent">
					<span class="keyword">const</span>
					<span class="string">profile</span>
					<span class="punctuation">=</span>
					<span class="keyword">await</span>
					<span class="function">getProfileData</span>
					<span class="punctuation">();</span>
				</div>
				<div class="line indent">
					<span class="keyword">const</span>
					<span class="string">articles</span>
					<span class="punctuation">=</span>
					<span class="keyword">await</span>
					<span class="function">getArticleData</span>
					<span class="punctuation">();</span>
				</div>
				<div class="line indent">
					<span class="keyword">const</span>
					<span class="string">data</span>
					<span class="punctuation">=</span>
					<span class="keyword">await</span>
					<span class="function">combine</span>
					<span class="punctuation">(</span>profile, articles<span class="punctuation">);</span>
				</div>
				<div class="line indent">
					<span class="keyword">return</span>
					<span class="string">data</span>
					<span class="punctuation">;</span>
				</div>
				<div class="line">
					<span class="punctuation">{`}`}</span>
				</div>
				<span class="cursor">|</span>
			</div>
		</div>
	</div>
{/if}
