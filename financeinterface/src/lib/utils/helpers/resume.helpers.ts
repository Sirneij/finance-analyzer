import type { Resume } from '$lib/types/resume.types';
import { fetchWithTimeout, retryFetch } from './dev.to.helpers';

export const fetchResume = async () => {
	const resume = await retryFetch(async () => {
		const response = await fetchWithTimeout('/finanalyzer/api/about/resumes', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		return data;
	});

	return resume as Resume;
};
