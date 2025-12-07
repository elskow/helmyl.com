/**
 * Generate games.json from ROM files in the roms folder
 *
 * Usage: npx tsx scripts/generate-games-json.ts
 *
 * This script scans the roms folder for .gb and .gbc files and generates
 * a games.json file with metadata for each ROM.
 *
 * Game names are derived from filenames:
 * - tobu-tobu-girl.gb -> "Tobu Tobu Girl"
 * - 2048.gb -> "2048"
 * - snake.gb -> "Snake"
 */

import fs from 'fs/promises';
import path from 'path';

interface GameEntry {
	file: string;
	name: string;
	genre: string;
}

// Map of known genres (can be extended)
const KNOWN_GENRES: Record<string, string> = {
	'tobu-tobu-girl': 'Platformer',
	'2048': 'Puzzle',
	geometrix: 'Puzzle',
	snake: 'Arcade',
	ucity: 'City Builder',
	tetris: 'Puzzle',
	pong: 'Arcade',
	breakout: 'Arcade',
	flappy: 'Arcade',
	'space-invaders': 'Arcade',
	pacman: 'Arcade'
};

/**
 * Convert filename to display name
 * e.g., "tobu-tobu-girl.gb" -> "Tobu Tobu Girl"
 */
function filenameToDisplayName(filename: string): string {
	// Remove extension
	const name = filename.replace(/\.(gb|gbc)$/i, '');

	// Handle pure numbers (like "2048")
	if (/^\d+$/.test(name)) {
		return name;
	}

	// Convert kebab-case/snake_case to Title Case
	return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Get genre for a game based on filename
 */
function getGenre(filename: string): string {
	const name = filename.replace(/\.(gb|gbc)$/i, '').toLowerCase();

	// Check known genres
	for (const [key, genre] of Object.entries(KNOWN_GENRES)) {
		if (name.includes(key)) {
			return genre;
		}
	}

	// Default genre
	return 'Game';
}

async function generateGamesJson() {
	const romsDir = path.join(process.cwd(), 'roms');
	const outputPath = path.join(romsDir, 'games.json');

	try {
		// Read all files in roms directory
		const files = await fs.readdir(romsDir);

		// Filter for ROM files
		const romFiles = files.filter((file) => /\.(gb|gbc)$/i.test(file) && !file.startsWith('.'));

		// Sort alphabetically
		romFiles.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

		// Generate game entries
		const games: GameEntry[] = romFiles.map((file) => ({
			file,
			name: filenameToDisplayName(file),
			genre: getGenre(file)
		}));

		// Check if existing games.json has custom metadata to preserve
		let existingGames: GameEntry[] = [];
		try {
			const existingContent = await fs.readFile(outputPath, 'utf-8');
			existingGames = JSON.parse(existingContent);
		} catch {
			// No existing file or invalid JSON
		}

		// Merge: preserve custom names/genres from existing file
		const existingMap = new Map(existingGames.map((g) => [g.file, g]));
		const mergedGames = games.map((game) => {
			const existing = existingMap.get(game.file);
			if (existing) {
				// Preserve custom name/genre if they were manually set
				return {
					file: game.file,
					name: existing.name || game.name,
					genre: existing.genre || game.genre
				};
			}
			return game;
		});

		// Write games.json
		await fs.writeFile(outputPath, JSON.stringify(mergedGames, null, 2) + '\n');

		console.log(`Generated games.json with ${mergedGames.length} games:`);
		mergedGames.forEach((game) => {
			console.log(`  - ${game.name} (${game.file})`);
		});
	} catch (error) {
		console.error('Error generating games.json:', error);
		process.exit(1);
	}
}

generateGamesJson();
