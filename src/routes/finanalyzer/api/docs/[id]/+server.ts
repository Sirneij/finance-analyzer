import type { CustomError } from '$lib/types/errors.types';
import { BASE_API_URI } from '$lib/utils/contants';
import { json } from '@sveltejs/kit';

export async function PUT({ fetch, request, params }) {
	const response = await fetch(`${BASE_API_URI}/v1/docs/endpoints/${params.id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(await request.json())
	});

	if (!response.ok) {
		const res = await response.json();
		const errors: Array<CustomError> = [];
		errors.push({ error: res.error, id: Math.floor(Math.random() * 100) });
		return json({ errors }, { status: 400 });
	}

	const data = await response.json();

	return json(data, { status: 200 });
}
