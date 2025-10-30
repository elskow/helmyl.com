/**
 * Generate OG images for all posts and projects at build time
 */

import { Resvg } from '@resvg/resvg-js';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import satori from 'satori';
import sharp from 'sharp';

// Import content collections
const postsPath = join(process.cwd(), '.content-collections/generated/allPosts.js');
const projectsPath = join(process.cwd(), '.content-collections/generated/allProjects.js');

interface Post {
	slug: string;
	title: string;
	excerpt?: string;
	description?: string;
}

interface Project {
	slug: string;
	name: string;
	description?: string;
}

// Convert Svelte component to React-like structure for Satori
function createOgElement(title: string, description: string = '', type: string = 'default') {
	// Special design for homepage
	if (type === 'home') {
		return {
			type: 'div',
			props: {
				style: {
					display: 'flex',
					width: '100%',
					height: '100%',
					background: '#ffffff'
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								flexDirection: 'column',
								width: '100%',
								height: '100%',
								padding: '80px',
								justifyContent: 'space-between'
							},
							children: [
								// Top decorative elements
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											gap: '16px',
											alignItems: 'center',
											justifyContent: 'space-between',
											width: '100%'
										},
										children: [
											{
												type: 'div',
												props: {
													style: {
														display: 'flex',
														gap: '16px',
														alignItems: 'center'
													},
													children: [
														{
															type: 'div',
															props: {
																style: {
																	width: '80px',
																	height: '80px',
																	background: '#f1f5f9',
																	borderRadius: '50%',
																	filter: 'blur(20px)',
																	opacity: 0.7
																}
															}
														},
														{
															type: 'div',
															props: {
																style: {
																	width: '50px',
																	height: '50px',
																	background: '#e2e8f0',
																	transform: 'rotate(45deg)',
																	filter: 'blur(15px)',
																	opacity: 0.6
																}
															}
														},
														{
															type: 'div',
															props: {
																style: {
																	width: '35px',
																	height: '35px',
																	background: '#cbd5e1',
																	borderRadius: '50%',
																	filter: 'blur(10px)',
																	opacity: 0.5
																}
															}
														}
													]
												}
											},
											{
												type: 'div',
												props: {
													style: {
														display: 'flex',
														gap: '12px',
														alignItems: 'center'
													},
													children: [
														{
															type: 'div',
															props: {
																style: {
																	width: '45px',
																	height: '45px',
																	background: '#e2e8f0',
																	transform: 'rotate(25deg)',
																	filter: 'blur(14px)',
																	opacity: 0.55
																}
															}
														},
														{
															type: 'div',
															props: {
																style: {
																	width: '65px',
																	height: '65px',
																	background: '#f1f5f9',
																	borderRadius: '50%',
																	filter: 'blur(18px)',
																	opacity: 0.65
																}
															}
														}
													]
												}
											}
										]
									}
								},
								// Main content
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											flexDirection: 'column',
											gap: '24px'
										},
										children: [
											{
												type: 'h1',
												props: {
													style: {
														fontSize: '72px',
														fontWeight: 700,
														background:
															'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
														backgroundClip: 'text',
														color: 'transparent',
														margin: 0,
														lineHeight: 1.1,
														letterSpacing: '-0.04em',
														maxWidth: '900px'
													},
													children: title
												}
											},
											{
												type: 'p',
												props: {
													style: {
														fontSize: '32px',
														color: '#475569',
														margin: 0,
														fontWeight: 400,
														maxWidth: '800px'
													},
													children: description
												}
											},
											{
												type: 'div',
												props: {
													style: {
														display: 'flex',
														flexDirection: 'column',
														gap: '16px',
														marginTop: '32px'
													},
													children: [
														{
															type: 'div',
															props: {
																style: {
																	display: 'flex',
																	alignItems: 'center',
																	gap: '12px'
																},
																children: [
																	{
																		type: 'div',
																		props: {
																			style: {
																				width: '60px',
																				height: '4px',
																				background:
																					'#0f172a'
																			}
																		}
																	},
																	{
																		type: 'div',
																		props: {
																			style: {
																				width: '35px',
																				height: '4px',
																				background:
																					'#cbd5e1'
																			}
																		}
																	},
																	{
																		type: 'div',
																		props: {
																			style: {
																				width: '20px',
																				height: '4px',
																				background:
																					'#e2e8f0'
																			}
																		}
																	}
																]
															}
														},
														{
															type: 'span',
															props: {
																style: {
																	fontSize: '18px',
																	color: '#64748b',
																	fontWeight: 400
																},
																children: 'Helmy Luqmanulhakim'
															}
														}
													]
												}
											}
										]
									}
								},
								// Bottom decorative elements
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											gap: '20px',
											alignItems: 'center',
											justifyContent: 'space-between',
											width: '100%'
										},
										children: [
											{
												type: 'div',
												props: {
													style: {
														display: 'flex',
														gap: '14px',
														alignItems: 'center'
													},
													children: [
														{
															type: 'div',
															props: {
																style: {
																	width: '55px',
																	height: '55px',
																	background: '#cbd5e1',
																	borderRadius: '50%',
																	filter: 'blur(16px)',
																	opacity: 0.6
																}
															}
														},
														{
															type: 'div',
															props: {
																style: {
																	width: '38px',
																	height: '38px',
																	background: '#e2e8f0',
																	transform: 'rotate(30deg)',
																	filter: 'blur(11px)',
																	opacity: 0.5
																}
															}
														}
													]
												}
											},
											{
												type: 'div',
												props: {
													style: {
														display: 'flex',
														gap: '18px',
														alignItems: 'center'
													},
													children: [
														{
															type: 'div',
															props: {
																style: {
																	width: '60px',
																	height: '60px',
																	background: '#e2e8f0',
																	filter: 'blur(18px)',
																	opacity: 0.6
																}
															}
														},
														{
															type: 'div',
															props: {
																style: {
																	width: '100px',
																	height: '100px',
																	background: '#f1f5f9',
																	borderRadius: '50%',
																	filter: 'blur(25px)',
																	opacity: 0.7
																}
															}
														},
														{
															type: 'div',
															props: {
																style: {
																	width: '40px',
																	height: '40px',
																	background: '#cbd5e1',
																	transform: 'rotate(45deg)',
																	filter: 'blur(12px)',
																	opacity: 0.5
																}
															}
														},
														{
															type: 'div',
															props: {
																style: {
																	width: '48px',
																	height: '48px',
																	background: '#e2e8f0',
																	borderRadius: '50%',
																	filter: 'blur(15px)',
																	opacity: 0.55
																}
															}
														}
													]
												}
											}
										]
									}
								}
							]
						}
					}
				]
			}
		};
	}

	const displayTitle = title.length > 60 ? title.slice(0, 60) + '...' : title;
	const displayDescription =
		description && description.length > 140 ? description.slice(0, 140) + '...' : description;

	const typeLabel =
		type === 'article'
			? 'Writing'
			: type === 'project'
				? 'Project'
				: type === 'lab'
					? 'Lab'
					: '';

	return {
		type: 'div',
		props: {
			style: {
				display: 'flex',
				width: '100%',
				height: '100%',
				background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
			},
			children: [
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							flexDirection: 'column',
							width: '100%',
							height: '100%',
							padding: '70px',
							justifyContent: 'space-between'
						},
						children: [
							// Top bar with type label only
							...(typeLabel
								? [
										{
											type: 'div',
											props: {
												style: {
													display: 'flex',
													alignItems: 'center',
													paddingBottom: '20px',
													borderBottom: '1px solid #cbd5e1'
												},
												children: [
													{
														type: 'div',
														props: {
															style: {
																fontSize: '16px',
																color: '#64748b',
																textTransform: 'uppercase',
																letterSpacing: '0.1em',
																fontWeight: 500
															},
															children: typeLabel
														}
													}
												]
											}
										}
									]
								: []),
							// Main content
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										flexDirection: 'column',
										flex: 1,
										justifyContent: 'center',
										gap: '28px',
										paddingTop: '40px',
										paddingBottom: '40px'
									},
									children: [
										{
											type: 'h1',
											props: {
												style: {
													fontSize: '58px',
													fontWeight: 700,
													color: '#0f172a',
													margin: 0,
													lineHeight: 1.1,
													maxWidth: '1000px',
													letterSpacing: '-0.03em'
												},
												children: displayTitle
											}
										},
										...(displayDescription
											? [
													{
														type: 'p',
														props: {
															style: {
																fontSize: '26px',
																color: '#475569',
																margin: 0,
																lineHeight: 1.5,
																maxWidth: '900px',
																fontWeight: 400
															},
															children: displayDescription
														}
													}
												]
											: [])
									]
								}
							},
							// Bottom signature
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										alignItems: 'center',
										gap: '16px',
										paddingTop: '20px',
										borderTop: '1px solid #cbd5e1'
									},
									children: [
										{
											type: 'img',
											props: {
												src: 'https://helmyl.com/favicons/favicon-32x32.png',
												width: 48,
												height: 48,
												style: {
													borderRadius: '50%'
												}
											}
										},
										{
											type: 'div',
											props: {
												style: {
													display: 'flex',
													flexDirection: 'column',
													gap: '4px'
												},
												children: [
													{
														type: 'div',
														props: {
															style: {
																fontSize: '18px',
																fontWeight: 600,
																color: '#0f172a'
															},
															children: 'Helmy Luqmanulhakim'
														}
													},
													{
														type: 'div',
														props: {
															style: {
																fontSize: '14px',
																color: '#64748b'
															},
															children: 'Software Engineer'
														}
													}
												]
											}
										}
									]
								}
							}
						]
					}
				}
			]
		}
	};
}

async function generateOgImage(
	title: string,
	description: string,
	outputPath: string,
	type: string = 'default'
) {
	try {
		const element = createOgElement(title, description, type);

		// Fetch fonts from a reliable CDN
		const fontRegular = await fetch(
			'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-400-normal.woff'
		);
		const fontBold = await fetch(
			'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-700-normal.woff'
		);
		const fontRegularData = await fontRegular.arrayBuffer();
		const fontBoldData = await fontBold.arrayBuffer();

		// Generate SVG with Satori
		const svg = await satori(element, {
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Inter',
					data: fontRegularData,
					weight: 400,
					style: 'normal'
				},
				{
					name: 'Inter',
					data: fontBoldData,
					weight: 600,
					style: 'normal'
				},
				{
					name: 'Inter',
					data: fontBoldData,
					weight: 700,
					style: 'normal'
				}
			]
		});

		// Convert SVG to PNG using Resvg
		const resvg = new Resvg(svg, {
			fitTo: {
				mode: 'width',
				value: 1200
			}
		});

		const pngData = resvg.render();
		const pngBuffer = pngData.asPng();

		// Optimize with sharp
		await sharp(pngBuffer).png({ quality: 90, compressionLevel: 9 }).toFile(outputPath);

		console.log(`✓ Generated: ${outputPath}`);
	} catch (error) {
		console.error(`✗ Failed to generate ${outputPath}:`, error);
	}
}

async function main() {
	console.log('Generating OG images...\n');

	// Create output directories
	const ogDir = join(process.cwd(), 'static/og');
	const writingsDir = join(ogDir, 'writings');
	const projectsDir = join(ogDir, 'projects');

	[ogDir, writingsDir, projectsDir].forEach((dir) => {
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
	});

	// Generate default homepage OG image with special design
	await generateOgImage(
		'Building Solutions',
		'Software Engineer • Web & Data',
		join(ogDir, 'home.png'),
		'home'
	);

	// Generate OG images for other pages
	await generateOgImage(
		'About',
		'Learn more about my background, skills, and professional journey in software engineering.',
		join(ogDir, 'about.png'),
		'default'
	);

	await generateOgImage(
		'Labs',
		'Explore hands-on experiments, interactive demos, and technical labs showcasing various technologies.',
		join(ogDir, 'labs.png'),
		'default'
	);

	await generateOgImage(
		'Uses',
		'Discover the tools, technologies, and equipment I use for software development.',
		join(ogDir, 'uses.png'),
		'default'
	);

	await generateOgImage(
		'Projects',
		'Explore my software development projects spanning web applications, data engineering, and technical solutions.',
		join(ogDir, 'projects-list.png'),
		'default'
	);

	await generateOgImage(
		'Writing',
		'Read my thoughts, insights, and articles on software development, data engineering, and tech trends.',
		join(ogDir, 'writings-list.png'),
		'default'
	);

	// Generate OG images for blog posts
	if (existsSync(postsPath)) {
		// Import the JS module (default export)
		const postsModule = await import(postsPath);
		const posts: Post[] = postsModule.default || [];
		console.log(`\nGenerating OG images for ${posts.length} posts...`);

		for (const post of posts) {
			const description = post.excerpt || post.description || '';
			await generateOgImage(
				post.title,
				description,
				join(writingsDir, `${post.slug}.png`),
				'article'
			);
		}
	}

	// Generate OG images for projects
	if (existsSync(projectsPath)) {
		// Import the JS module (default export)
		const projectsModule = await import(projectsPath);
		const projects: Project[] = projectsModule.default || [];
		console.log(`\nGenerating OG images for ${projects.length} projects...`);

		for (const project of projects) {
			await generateOgImage(
				project.name,
				project.description || '',
				join(projectsDir, `${project.slug}.png`),
				'project'
			);
		}
	}

	console.log('\nOG image generation complete!\n');
}

main().catch(console.error);
