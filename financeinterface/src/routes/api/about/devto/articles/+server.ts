import { DEVTO_API_KEY } from '$lib/utils/contants';
import { json } from '@sveltejs/kit';

export async function GET() {
	try {
		const response = await fetch('https://dev.to/api/articles/me/published?per_page=100', {
			headers: {
				'api-key': DEVTO_API_KEY
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const articles = await response.json();
		return json(articles);
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch articles' }), {
			status: 500
		});
	}
}
