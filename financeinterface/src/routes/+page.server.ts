import { getGithubDetails } from '$lib/utils/helpers/github.helpers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const githubDetails = await getGithubDetails(fetch);

	// Write the data into a JSON file. This is SvelteKit's `.server.ts` file.

	return {
		githubData: githubDetails
	};
};
