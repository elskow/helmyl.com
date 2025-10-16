import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { allPosts, allProjects } from '../.content-collections/generated/index.js';

// Create output directories
const postsDir = join(process.cwd(), 'static', 'api', 'posts');
const projectsDir = join(process.cwd(), 'static', 'api', 'projects');

mkdirSync(postsDir, { recursive: true });
mkdirSync(projectsDir, { recursive: true });

// Generate posts metadata (for list view)
const postsMetadata = allPosts.map((post) => ({
	title: post.title,
	slug: post.slug,
	date: post.date,
	readTime: post.readTime,
	image: post.image,
	lastModified: post.lastModified
}));

writeFileSync(
	join(process.cwd(), 'static', 'api', 'posts-metadata.json'),
	JSON.stringify(postsMetadata, null, 0),
	'utf-8'
);

console.log(`✓ Generated posts-metadata.json with ${postsMetadata.length} posts`);

// Generate individual post JSON files (for detail view)
allPosts.forEach((post) => {
	const postData = {
		title: post.title,
		slug: post.slug,
		date: post.date,
		readTime: post.readTime,
		image: post.image,
		lastModified: post.lastModified,
		html: post.html,
		excerpt: post.excerpt,
		description: post.description,
		tags: post.tags
	};

	writeFileSync(
		join(postsDir, `${post.slug}.json`),
		JSON.stringify(postData, null, 0),
		'utf-8'
	);
});

console.log(`✓ Generated ${allPosts.length} individual post JSON files`);

// Generate projects metadata (for list view)
const projectsMetadata = allProjects.map((project) => ({
	name: project.name,
	description: project.description,
	github: project.github,
	stacks: project.stacks,
	date: project.date,
	priority: project.priority,
	slug: project.slug,
	lastModified: project.lastModified,
	hasContent: project.html && project.html.trim() !== ''
}));

writeFileSync(
	join(process.cwd(), 'static', 'api', 'projects-metadata.json'),
	JSON.stringify(projectsMetadata, null, 0),
	'utf-8'
);

console.log(`✓ Generated projects-metadata.json with ${projectsMetadata.length} projects`);

// Generate individual project JSON files (for detail view)
allProjects.forEach((project) => {
	const projectData = {
		name: project.name,
		description: project.description,
		github: project.github,
		stacks: project.stacks,
		date: project.date,
		priority: project.priority,
		slug: project.slug,
		lastModified: project.lastModified,
		html: project.html,
		demo: project.demo,
		image: project.image
	};

	writeFileSync(
		join(projectsDir, `${project.slug}.json`),
		JSON.stringify(projectData, null, 0),
		'utf-8'
	);
});

console.log(`✓ Generated ${allProjects.length} individual project JSON files`);
console.log('\n✨ Content JSON generation complete!');
