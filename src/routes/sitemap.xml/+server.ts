import { BASE_API_URI } from '$lib/utils/contants';
import { dev } from '$app/environment';
import type { IArticlePopulated } from '$lib/types/articles.types';

const DOMAIN = dev ? 'http://localhost:8000' : 'https://johnowolabiidogun.dev';

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface SitemapEntry {
	url: string;
	priority: string;
	changefreq: ChangeFreq;
	images?: { url: string; caption: string; title?: string }[];
	lang?: string;
}

function formatDate(date: string | undefined): string {
	try {
		return date
			? new Date(date).toISOString().split('T')[0]
			: new Date().toISOString().split('T')[0];
	} catch {
		return new Date().toISOString().split('T')[0];
	}
}

export async function GET({ cookies }) {
	try {
		const response = await fetch(`${BASE_API_URI}/v1/articles?limit=-1`, {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			},
			cache: 'no-cache',
			credentials: 'include'
		});
		if (!response.ok) throw new Error('Failed to fetch articles');

		const { articles }: { articles: IArticlePopulated[] } = await response.json();
		const lastmod = formatDate(new Date().toISOString());

		const staticPages: SitemapEntry[] = [
			{ url: '/', priority: '1.0', changefreq: 'daily', lang: 'en' },
			{ url: '/finanalyzer/docs', priority: '0.8', changefreq: 'weekly', lang: 'en' },
			{ url: '/blogs', priority: '0.9', changefreq: 'daily', lang: 'en' }
		];

		let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

		// Add static pages
		staticPages.forEach((page) => {
			xml += `
    <url>
        <loc>${DOMAIN}${page.url}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
        <xhtml:link rel="alternate" hreflang="${page.lang}" href="${DOMAIN}${page.url}"/>
    </url>`;
		});

		// Add blog articles
		for (const article of articles) {
			const formattedLastmod = formatDate(article.updatedAt);
			const isRecent =
				new Date(article.updatedAt || '').getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
			const articlePriority = isRecent ? '0.9' : '0.8';

			xml += `
    <url>
        <loc>${DOMAIN}/blogs/${article.slug}/${article._id}</loc>
        <lastmod>${formattedLastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${articlePriority}</priority>
        <xhtml:link rel="alternate" hreflang="en" href="${DOMAIN}/blogs/${article.slug}/${article._id}"/>
        ${article.tags?.length ? `<news:keywords>${article.tags.map((tag) => tag.name).join(', ')}</news:keywords>` : ''}
        ${article.tags
					?.map(
						(tag) => `
        <tag:info xmlns:tag="http://www.sitemaps.org/schemas/sitemap-tags/0.9">
            <tag:name>${tag.name}</tag:name>
            <tag:description>${tag.description || ''}</tag:description>
        </tag:info>`
					)
					.join('')}`;

			if (article.foreImage) {
				xml += `
        <image:image>
            <image:loc>${article.foreImage}</image:loc>
            <image:title>${article.title || ''}</image:title>
            <image:caption>${article.title || ''}</image:caption>
        </image:image>`;
			}

			xml += `
    </url>`;
		}

		xml += '\n</urlset>';

		return new Response(xml.trim(), {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'public, max-age=3600',
				'Last-Modified': new Date().toUTCString(),
				'X-Content-Type-Options': 'nosniff'
			}
		});
	} catch (error) {
		console.error('Sitemap generation failed:', error);
		return new Response('Error generating sitemap', {
			status: 500,
			headers: {
				'Content-Type': 'text/plain',
				'Cache-Control': 'no-store'
			}
		});
	}
}
