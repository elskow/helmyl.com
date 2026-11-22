import type { APIRoute } from 'astro';
import labsMetadata from '@/lib/generated/labs-metadata.json';

const origin = 'https://helmyl.com';

const parseLabDate = (value: string) => {
	const normalized = value.replace(
		/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/,
		'$1T$2$3:$4'
	);
	const date = new Date(normalized);
	if (Number.isNaN(date.getTime())) return undefined;
	return date.toISOString().split('T')[0];
};

const staticPages = [
	{ loc: `${origin}/`, changefreq: 'weekly', priority: '1.0' },
	{ loc: `${origin}/about`, changefreq: 'monthly', priority: '0.7' },
	{ loc: `${origin}/projects`, changefreq: 'monthly', priority: '0.9' },
	{ loc: `${origin}/labs`, changefreq: 'monthly', priority: '0.8' }
];

const labPages = labsMetadata.map((lab) => ({
	loc: `${origin}/labs/${lab.slug}`,
	changefreq: 'monthly',
	priority: '0.6',
	lastmod: parseLabDate(lab.editedAt)
}));

const urls: Array<{ loc: string; changefreq: string; priority: string; lastmod?: string }> = [
	...staticPages,
	...labPages
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map((u) => {
		const lines = [`    <loc>${u.loc}</loc>`];
		if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
		lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
		lines.push(`    <priority>${u.priority}</priority>`);
		return `  <url>\n${lines.join('\n')}\n  </url>`;
	})
	.join('\n')}
</urlset>`;

export const GET: APIRoute = () =>
	new Response(xml, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
