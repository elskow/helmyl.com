import fs from 'fs/promises';
import path from 'path';

interface LabMetadata {
	name: string;
	description: string;
	version: string;
	slug: string;
	author: string;
	homepage: string;
	repository: string;
}

async function generateLabsMetadata() {
	const packagesDir = path.join(process.cwd(), '..', 'packages');
	const labs: LabMetadata[] = [];

	try {
		const entries = await fs.readdir(packagesDir, { withFileTypes: true });

		for (const entry of entries) {
			// Skip non-directories and hidden files
			if (!entry.isDirectory() || entry.name.startsWith('.')) {
				continue;
			}

			const dir = entry.name;
			const packageJsonPath = path.join(packagesDir, dir, 'package.json');

			try {
				const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

				labs.push({
					name: packageJson.name?.replace('@labs/', '') || dir,
					description: packageJson.description || '',
					version: packageJson.version || '0.0.0',
					slug: dir,
					author: packageJson.author || '',
					homepage: packageJson.homepage || '',
					repository: packageJson.repository?.url || ''
				});

				console.log(`  ✓ Found lab: ${dir}`);
			} catch (err) {
				console.warn(`  ⚠ Skipping ${dir}: no valid package.json`);
			}
		}

		// Sort labs alphabetically by name
		labs.sort((a, b) => a.name.localeCompare(b.name));

		await fs.writeFile(
			path.join(process.cwd(), 'src/lib/generated/labs-metadata.json'),
			JSON.stringify(labs, null, 2)
		);

		console.log(`\nLabs metadata generated successfully! (${labs.length} labs found)`);
	} catch (error) {
		console.error('Error generating labs metadata:', error);
	}
}

generateLabsMetadata();
