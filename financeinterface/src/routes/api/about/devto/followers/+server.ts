import { DEVTO_API_KEY } from '$lib/utils/contants';
import { error } from '@sveltejs/kit';

export async function GET({ fetch }) {
	try {
		const followers = await fetchAllFollowers(fetch);
		return new Response(
			JSON.stringify({
				count: followers.length,
				followers: followers
			}),
			{
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=3600'
				}
			}
		);
	} catch (err) {
		throw error(500, `Failed to fetch followers: ${err}`);
	}
}

async function fetchAllFollowers(sFetch: typeof fetch) {
	const followers = [];
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		try {
			const response = await sFetch(
				`https://dev.to/api/followers/users?page=${page}&per_page=1000`,
				{
					headers: {
						'api-key': DEVTO_API_KEY
					}
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.length === 0) {
				hasMore = false;
			} else {
				followers.push(...data);
				page++;
			}
		} catch (err) {
			console.error('Error fetching followers:', err);
			throw error(500, 'Failed to fetch followers');
		}
	}

	return followers;
}
