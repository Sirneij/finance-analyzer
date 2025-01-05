import { BASE_API_URI } from '$lib/utils/contants';
import { json } from '@sveltejs/kit';

export async function GET({ cookies, fetch }) {
	const response = await fetch(`${BASE_API_URI}/v1/transactions/analyze`, {
		method: 'GET',
		headers: {
			Cookie: `connect.sid=${cookies.get('connect.sid')}`
		}
	});

	if (!response.ok) {
		const res = await response.json();
		return json({ error: res.error }, { status: 400 });
	}

	const data = await response.json();

	return json(data, { status: 201 });
}
