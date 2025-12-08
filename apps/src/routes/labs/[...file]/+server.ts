import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
	// Web assets
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'application/javascript',
	'.mjs': 'application/javascript',
	'.json': 'application/json',
	'.map': 'application/json',
	// Images
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.webp': 'image/webp',
	// Fonts
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.otf': 'font/otf',
	'.eot': 'application/vnd.ms-fontobject',
	// Audio/Video
	'.mp3': 'audio/mpeg',
	'.wav': 'audio/wav',
	'.ogg': 'audio/ogg',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	// Binary/Special
	'.wasm': 'application/wasm',
	'.glb': 'model/gltf-binary',
	'.gltf': 'model/gltf+json',
	'.bin': 'application/octet-stream',
	// Game ROMs (for gbemu)
	'.gb': 'application/octet-stream',
	'.gbc': 'application/octet-stream',
	// Text
	'.txt': 'text/plain',
	'.xml': 'application/xml'
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
