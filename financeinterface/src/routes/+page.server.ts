import type { CustomError } from '$lib/types/errors.types';
import { getGithubDetails } from '$lib/utils/helpers/github.helpers';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { BASE_API_URI } from '$lib/utils/contants';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const [githubDetails, resume] = await Promise.all([
		getGithubDetails(fetch),
		fetch(`${BASE_API_URI}/v1/resumes/JOHN_OWOLABI_IDOGUN_RESUME`, {
			headers: {
				'Content-Type': 'application/json',
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			}
		})
			.then((res) => res.json())
			.catch(() => ({
				educations: [],
				experiences: [],
				skills: {},
				projects: []
			}))
	]);

	return {
		githubData: githubDetails,
		resume: resume
	};
};

export const actions: Actions = {
	upload: async ({ fetch, request, cookies }) => {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		// Some validations
		const errors: Array<CustomError> = [];

		if (!file) {
			errors.push({
				id: Math.floor(Math.random() * 100),
				error: `An acceptable file is required. Ensure you upload a file.`
			});
		}
		if (errors.length > 0) {
			return fail(400, { errors: errors });
		}

		const apiURL = `${BASE_API_URI}/v1/resumes`;

		const requestInitOptions: RequestInit = {
			method: 'POST',
			headers: {
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			},
			body: formData
		};

		const res = await fetch(apiURL, requestInitOptions);

		if (!res.ok) {
			const response = await res.json();
			const errors: Array<CustomError> = [];
			errors.push({ error: response.message, id: Math.floor(Math.random() * 100) });
			return fail(400, { errors: errors });
		}

		const response = await res.json();

		return {
			sucess: true,
			data: response
		};
	}
};
