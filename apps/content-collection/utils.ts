import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

export const calcLastModified = async (filePath: string, root: string) => {
	try {
		if (process.env.GITHUB_API_TOKEN) {
			// For submodules, we need to determine the correct repository
			// First check if we're in a submodule by looking for .git in the root
			const isSubmodule = await import('fs').then((fs) =>
				fs.promises
					.access(join(root, '.git'))
					.then(() => true)
					.catch(() => false)
			);

			if (isSubmodule) {
				// Try to get the remote origin URL for the submodule to determine the correct repo
				try {
					const { stdout: remoteUrl } = await exec(
						`cd "${root}" && git config --get remote.origin.url`
					);
					const repoMatch = remoteUrl.trim().match(/github\.com[/:]([\w-]+)\/([\w.-]+)(?:\.git)?$/);

					if (repoMatch) {
						const [, owner, repo] = repoMatch;
						const response = await fetch(
							`https://api.github.com/repos/${owner}/${repo}/commits?path=${filePath}`,
							{
								headers: {
									Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
									Accept: 'application/vnd.github.v3+json'
								}
							}
						);

						if (response.ok) {
							const commits = await response.json();
							if (commits && commits.length > 0) {
								return new Date(commits[0].commit.author.date).toISOString();
							}
						}
					}
				} catch (submoduleError) {
					console.warn(`Failed to get submodule info: ${submoduleError}`);
				}
			} else {
				// Original logic for main repository
				const relativePath = root + filePath;
				const response = await fetch(
					`https://api.github.com/repos/elskow/helmyl.com/commits?path=${relativePath}`,
					{
						headers: {
							Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
							Accept: 'application/vnd.github.v3+json'
						}
					}
				);

				if (response.ok) {
					const commits = await response.json();
					if (commits && commits.length > 0) {
						return new Date(commits[0].commit.author.date).toISOString();
					}
				}
			}
		} else {
			try {
				// Run git command from within the content directory (submodule)
				const { stdout } = await exec(
					`cd "${root}" && git log -1 --format=%cd --date=iso "${filePath}"`
				);

				if (stdout) {
					const lastModified = new Date(stdout.trim()).toISOString();
					return lastModified;
				}
			} catch (error) {
				console.warn(`Failed to get last modified date for ${filePath}: ${error}`);
			}
		}

		// Default to file modification time if git fails
		const fs = await import('fs');
		const stats = await fs.promises.stat(`${root}/${filePath}`);
		return stats.mtime.toISOString();
	} catch (error) {
		console.warn(`Failed to get last modified date for ${filePath}: ${error}`);
		return new Date().toISOString();
	}
};

import { join } from 'path';
