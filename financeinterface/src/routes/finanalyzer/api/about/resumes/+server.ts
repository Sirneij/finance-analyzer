import { BASE_API_URI } from '$lib/utils/contants';
import { json } from '@sveltejs/kit';

export async function GET({ cookies, fetch }) {
	try {
		const response = await fetch(`${BASE_API_URI}/v1/resumes/JOHN_OWOLABI_IDOGUN_RESUME`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return json(data, { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: `Failed to fetch resume: ${error}` }), {
			status: 500
		});
	}
}
