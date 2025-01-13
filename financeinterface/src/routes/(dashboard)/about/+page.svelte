<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	let skills = [
		{ name: 'Frontend Development', level: 90 },
		{ name: 'Backend Development', level: 95 },
		{ name: 'Database Design', level: 90 },
		{ name: 'System Architecture', level: 85 }
	];
</script>

<div
	class="min-h-screen bg-white p-8 text-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:text-gray-100"
>
	<div class="mx-auto max-w-4xl" in:fade={{ duration: 1000 }}>
		<!-- Hero Section -->
		<div class="mb-16 space-y-4 text-center" in:fly={{ y: 50, duration: 1000 }}>
			<h1
				class="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-5xl font-bold text-transparent dark:from-blue-400 dark:to-teal-400"
			>
				About Developer
			</h1>
			<p class="text-xl text-gray-600 dark:text-gray-400">
				Crafting Digital Experiences with Passion
			</p>
		</div>

		<!-- Profile Section -->
		<div class="mb-16 grid gap-8 md:grid-cols-2">
			<div class="space-y-6" in:fly={{ x: -50, duration: 1000 }}>
				<h2 class="text-3xl font-semibold">Hello, I'm John Doe</h2>
				<p class="leading-relaxed text-gray-600 dark:text-gray-400">
					A passionate full-stack developer with over 5 years of experience in building robust web
					applications. Specializing in modern web technologies and financial systems development.
				</p>
				<div class="flex space-x-4">
					<a
						href="https://github.com"
						class="text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
					>
						GitHub
					</a>
					<a
						href="https://linkedin.com"
						class="text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
					>
						LinkedIn
					</a>
				</div>
			</div>

			<div
				class="rounded-xl bg-gray-100 p-6 backdrop-blur-sm dark:bg-gray-800/50"
				in:fly={{ x: 50, duration: 1000 }}
			>
				<h3 class="mb-4 text-xl font-semibold">Technical Expertise</h3>
				<div class="space-y-4">
					{#each skills as skill}
						<div class="space-y-2">
							<div class="flex justify-between">
								<span>{skill.name}</span>
								<span>{skill.level}%</span>
							</div>
							<div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
								<div
									class="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-400"
									style="width: {skill.level}%"
									transition:fade
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Projects Section -->
		<div class="space-y-8" in:fly={{ y: 50, duration: 1000, delay: 300 }}>
			<h2 class="text-3xl font-semibold">Recent Projects</h2>
			<div class="grid gap-6 md:grid-cols-2">
				{#each Array(2) as _, i}
					<div
						class="rounded-xl bg-gray-100 p-6 backdrop-blur-sm transition-colors hover:bg-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-800/70"
					>
						<h3 class="mb-2 text-xl font-semibold">Project {i + 1}</h3>
						<p class="text-gray-600 dark:text-gray-400">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
							incididunt ut labore et dolore magna aliqua.
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
