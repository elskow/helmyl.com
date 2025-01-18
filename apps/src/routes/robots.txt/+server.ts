export const prerender = true;

export async function GET(): Promise<Response> {
    // prettier-ignore
    const body = [
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: ${import.meta.env.DEV ? 'http://localhost:5173' : 'https://helmyl.com'}/sitemap.xml`
    ].join('\n').trim();

    const headers = {
        'Content-Type': 'text/plain'
    };

    return new Response(body, {headers});
}