
import fs from 'fs/promises';
import path from 'path';

interface GameEntry {
	file: string;
	name: string;
	genre: string;
}

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

function filenameToDisplayName(filename: string): string {
	const name = filename.replace(/\.(gb|gbc)$/i, '');

	if (/^\d+$/.test(name)) {
		return name;
	}

	return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function getGenre(filename: string): string {
	const name = filename.replace(/\.(gb|gbc)$/i, '').toLowerCase();

	for (const [key, genre] of Object.entries(KNOWN_GENRES)) {
		if (name.includes(key)) {
			return genre;
		}
	}

	return 'Game';
}

async function generateGamesJson() {
	const romsDir = path.join(process.cwd(), 'roms');
	const outputPath = path.join(romsDir, 'games.json');

	try {
		const files = await fs.readdir(romsDir);

		const romFiles = files.filter((file) => /\.(gb|gbc)$/i.test(file) && !file.startsWith('.'));

		romFiles.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

		const games: GameEntry[] = romFiles.map((file) => ({
			file,
			name: filenameToDisplayName(file),
			genre: getGenre(file)
		}));

		let existingGames: GameEntry[] = [];
		try {
			const existingContent = await fs.readFile(outputPath, 'utf-8');
			existingGames = JSON.parse(existingContent);
		} catch {
		}

		const existingMap = new Map(existingGames.map((g) => [g.file, g]));
		const mergedGames = games.map((game) => {
			const existing = existingMap.get(game.file);
			if (existing) {
				return {
					file: game.file,
					name: existing.name || game.name,
					genre: existing.genre || game.genre
				};
			}
			return game;
		});

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
