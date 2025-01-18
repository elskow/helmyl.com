import fs from 'fs/promises';
import path from 'path';

async function generateLabsMetadata() {
	const packagesDir = path.join(process.cwd(), '..', 'packages');
	const labs = [];

	try {
		const directories = await fs.readdir(packagesDir);

		for (const dir of directories) {
			if (dir.endsWith('-labs')) {
				const packageJsonPath = path.join(packagesDir, dir, 'package.json');
				const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

				labs.push({
					name: packageJson.name.replace('@labs/', ''),
					description: packageJson.description,
					version: packageJson.version,
					slug: dir,
					author: packageJson.author || '',
					homepage: packageJson.homepage || '',
					repository: packageJson.repository?.url || ''
				});
			}
		}

		await fs.writeFile(
			path.join(process.cwd(), 'src/lib/generated/labs-metadata.json'),
			JSON.stringify(labs, null, 2)
		);

		console.log('Labs metadata generated successfully!');
	} catch (error) {
		console.error('Error generating labs metadata:', error);
	}
}

generateLabsMetadata();
