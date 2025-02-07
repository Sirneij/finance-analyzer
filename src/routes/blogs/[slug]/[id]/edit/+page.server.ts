import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
	throw redirect(308, `/blog/${params.slug}/${params.id}/edit`);
}
