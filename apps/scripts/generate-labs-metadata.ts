import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

interface LabMetadata {
	name: string;
	description: string;
	version: string;
	slug: string;
	editedAt: string;
	createdAt: string;
	author: string;
	homepage: string;
	repository: string;
}

function getLatestGitCommit(labDir: string): string {
	const result = execSync(
		`git log -1 --format=%cI --diff-filter=ACDMRT -- "${labDir}/"`,
		{ cwd: PROJECT_ROOT, encoding: 'utf-8' }
	).trim();
	return result || new Date(0).toISOString();
}

function getEarliestGitCommit(labDir: string): string {
	const result = execSync(
		`git log --all --format=%cI --reverse --diff-filter=A -- "${labDir}/"`,
		{ cwd: PROJECT_ROOT, encoding: 'utf-8' }
	).trim();
	return result.split('\n')[0]?.trim() || new Date(0).toISOString();
}

function generateLabsMetadata() {
	const packagesDir = path.join(PROJECT_ROOT, 'packages');
	const labs: LabMetadata[] = [];

	try {
		const entries = fs.readdirSync(packagesDir, { withFileTypes: true });

		for (const entry of entries) {
			if (!entry.isDirectory() || entry.name.startsWith('.')) {
				continue;
			}

			const dir = entry.name;
			const labDir = path.join(packagesDir, dir);
			const packageJsonPath = path.join(packagesDir, dir, 'package.json');

			try {
				const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

				labs.push({
					name: packageJson.name?.replace('@labs/', '') || dir,
					description: packageJson.description || '',
					version: packageJson.version || '0.0.0',
					slug: dir,
					editedAt: getLatestGitCommit(labDir),
					createdAt: getEarliestGitCommit(labDir),
					author: packageJson.author || '',
					homepage: packageJson.homepage || '',
					repository: packageJson.repository?.url || ''
				});

				console.log(`  ✓ Found lab: ${dir}`);
			} catch (err) {
				console.warn(`  ⚠ Skipping ${dir}: no valid package.json`);
			}
		}

		// Sort by latest edit time (newest first), then by creation time (newest first) as tiebreaker
		labs.sort((a, b) => {
			const timeDiff = new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime();
			if (timeDiff !== 0) return timeDiff;
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

		fs.writeFileSync(
			path.join(PROJECT_ROOT, 'apps/src/lib/generated/labs-metadata.json'),
			JSON.stringify(labs, null, 2)
		);

		console.log(`\nLabs metadata generated successfully! (${labs.length} labs found)`);
	} catch (error) {
		console.error('Error generating labs metadata:', error);
	}
}

generateLabsMetadata();
