import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
	throw redirect(301, `/blog/${params.slug}/${params.id}`);
}
