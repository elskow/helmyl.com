import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function GET({ params }) {
	console.log('Request for:', params.file);

	const filePath = path.join(process.cwd(), 'static', 'labs', params.file);
	console.log('Looking for file at:', filePath);

	try {
		const file = await fs.readFile(filePath);
		const ext = path.extname(filePath);
		const contentType =
			{
				'.html': 'text/html',
				'.css': 'text/css',
				'.js': 'application/javascript',
				'.json': 'application/json',
				'.png': 'image/png',
				'.jpg': 'image/jpeg',
				'.jpeg': 'image/jpeg',
				'.gif': 'image/gif'
			}[ext] || 'application/octet-stream';

		return new Response(file, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'no-cache',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (e) {
		console.error('Error serving file:', e);
		throw error(404, `File not found: ${params.file}`);
	}
}
