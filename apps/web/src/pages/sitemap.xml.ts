import type { APIRoute } from 'astro';

const origin = 'https://helmyl.com';

const urls = [
	{ loc: `${origin}/`, changefreq: 'weekly', priority: '1.0' }
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map((u) => {
		const lines = [`    <loc>${u.loc}</loc>`];
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
