export const prerender = true;

export async function GET(): Promise<Response> {
	// prettier-ignore
	const body = [
		'User-agent: *',
		'Allow: /',
		'',
		`Sitemap: ${import.meta.env.VITE_APP_URL ?? `${import.meta.env.DEV ? 'http://localhost:5173' : 'https://localhost:4173'}`}/sitemap.xml`
	].join('\n').trim();

	const headers = {
		'Content-Type': 'text/plain'
	};

	return new Response(body, { headers });
}