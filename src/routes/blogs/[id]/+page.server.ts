import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const article = {
		id: `${params.id}`,
		title: 'Getting Started with Svelte 5: A Comprehensive Guide',
		series: 'Svelte Tutorial',
		tags: ['svelte', 'javascript', 'webdev', 'tutorial'],
		coverImage:
			'https://res.cloudinary.com/practicaldev/image/fetch/s--uigxYVRB--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4a6t7pmm323uaz9rv1rf.png',
		createdAt: '2024-03-15T12:00:00Z',
		updatedAt: '2024-03-15T16:00:00Z',
		content: `
  # Getting Started with Svelte 5
  
  Svelte 5 introduces revolutionary changes to the way we build web applications. Let's dive into the new features and best practices.
  
  <div class="admonition note">
  <span class="title"><b>Note:</b></span>
  <p>This guide assumes basic familiarity with JavaScript and web development concepts.</p>
  </div>
  
  ## Setting Up Your Development Environment
  
  First, let's create a new Svelte project using the latest template:
  
  \`\`\`bash
  npm create svelte@latest my-svelte5-app
  cd my-svelte5-app
  npm install
  \`\`\`
  
  <div class="admonition tip">
  <span class="title"><b>Tip:</b></span>
  <p>Use VS Code with the Svelte extension for the best development experience.</p>
  </div>
  
  ## Key Features in Svelte 5
  
  ### 1. Runes
  
  Runes are the new way to handle reactivity in Svelte 5. They replace the traditional reactive statements:
  
  \`\`\`javascript
  <script lang="ts">
  // In your Svelte component
  let count = $state(0);
  
  function increment() {
    count++;
  }
  </script>
  // Template
  <button onclick={increment}>
    Count is {count}
  </button>
  \`\`\`
  
  <div class="admonition warning">
  <span class="title"><b>Warning:</b></span>
  <p>Runes are not compatible with older Svelte syntax. You'll need to migrate your existing code.</p>
  </div>
  
  ### 2. New Lifecycle Methods
  
  Svelte 5 introduces improved lifecycle methods:
  
  \`\`\`javascript
  // In your Svelte component
  \\$effect(() => {
    console.log('Component mounted');
    return () => console.log('Component destroyed');
  });
  \`\`\`
  
  ### 3. Enhanced Props System
  
  The new props system is more intuitive:
  
  \`\`\`javascript
  // In your Svelte component
  let { title = \\$prop('Default Title') } = \\$props();
  \`\`\`
  
  ## Best Practices
  
  1. Always use TypeScript for better type safety
  2. Leverage the new runes system for state management
  3. Keep components small and focused
  
  ## Integration with GitHub
  
  You can find the official Svelte repository here:
  
  [github.com/sveltejs/svelte](https://github.com/sveltejs/svelte)
  
  <div class="admonition tip">
  <span class="title"><b>Tip:</b></span>
  <p>Star the repository to stay updated with the latest changes and contribute to the community!</p>
  </div>
  
  ## Common Patterns
  
  Here's a practical example of a reusable component:
  
  \`\`\`typescript
  // Button.svelte
  interface ButtonProps {
    variant: 'primary' | 'secondary';
    size: 'sm' | 'md' | 'lg';
  }
  
  let { 
    variant = \\$prop<ButtonProps['variant']>('primary'),
    size = \\$prop<ButtonProps['size']>('md')
  } = \\$props();
  
  const styles = \\$derived(\`
    btn 
    btn-\${variant} 
    btn-\${size}
  \`);
  \`\`\`
  `
	};

	return {
		article
	};
};
