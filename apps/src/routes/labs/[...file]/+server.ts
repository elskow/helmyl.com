import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'application/javascript',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif'
};

export const GET: RequestHandler = async ({ params }) => {
	const { file } = params;
	if (!file) {
		throw error(400, 'Missing lab file name');
	}

	const filePath = path.join(process.cwd(), 'static', 'labs', file);

	try {
		const fileBuffer = await fs.readFile(filePath);
		const ext = path.extname(filePath);
		const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

		return new Response(new Uint8Array(fileBuffer), {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'no-cache',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (cause) {
		console.error('Error serving lab asset', cause);
		throw error(404, `File not found: ${file}`);
	}
};
