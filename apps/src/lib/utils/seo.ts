/**
 * SEO utility functions for generating meta tags and structured data
 */

export interface SEOConfig {
	title: string;
	description: string;
	url: string;
	image?: string;
	type?: 'website' | 'article' | 'profile';
	publishedTime?: string;
	modifiedTime?: string;
	author?: string;
	tags?: string[];
	section?: string;
}

const SITE_NAME = 'Helmy Luqmanulhakim';
const TWITTER_HANDLE = '@helmyl';
const BASE_URL = 'https://helmyl.com';

/**
 * Generate OG image URL for static images
 * Images are generated at build time using generate-og-images.ts script
 */
export function getOgImageUrl(
	slug: string,
	type: 'default' | 'article' | 'project' | 'lab' = 'default'
): string {
	// Map to static OG image paths
	if (type === 'article') {
		return `${BASE_URL}/og/writings/${slug}.png`;
	} else if (type === 'project') {
		return `${BASE_URL}/og/projects/${slug}.png`;
	} else {
		return `${BASE_URL}/og/home.png`;
	}
}

/**
 * Generate comprehensive meta tags for a page
 */
export function generateMetaTags(config: SEOConfig): Record<string, string> {
	const {
		title,
		description,
		url,
		image,
		type = 'website',
		publishedTime,
		modifiedTime,
		author,
		tags,
		section
	} = config;

	const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
	// Generate dynamic OG image if no image provided
	const fullImage = image
		? image.startsWith('http')
			? image
			: `${BASE_URL}${image}`
		: getOgImageUrl('home', type === 'article' ? 'article' : 'default');

	const meta: Record<string, string> = {
		// Primary Meta Tags
		title,
		description,

		// Open Graph / Facebook
		'og:type': type,
		'og:url': fullUrl,
		'og:title': title,
		'og:description': description,
		'og:image': fullImage,
		'og:site_name': SITE_NAME,
		'og:locale': 'en_US',

		// Twitter
		'twitter:card': 'summary_large_image',
		'twitter:url': fullUrl,
		'twitter:title': title,
		'twitter:description': description,
		'twitter:image': fullImage,
		'twitter:site': TWITTER_HANDLE,
		'twitter:creator': TWITTER_HANDLE
	};

	// Article-specific meta tags
	if (type === 'article') {
		if (publishedTime) {
			meta['article:published_time'] = publishedTime;
		}
		if (modifiedTime) {
			meta['article:modified_time'] = modifiedTime;
		}
		if (author) {
			meta['article:author'] = author;
		}
		if (section) {
			meta['article:section'] = section;
		}
		if (tags && tags.length > 0) {
			// Store as JSON string to handle in template
			meta['article:tag'] = JSON.stringify(tags);
		}
	}

	return meta;
}

/**
 * Generate structured data for an article
 */
export function generateArticleStructuredData(config: {
	title: string;
	description: string;
	url: string;
	image?: string;
	publishedTime?: string;
	modifiedTime?: string;
	author?: string;
	tags?: string[];
	content?: string;
	wordCount?: number;
}) {
	const {
		title,
		description,
		url,
		image,
		publishedTime,
		modifiedTime,
		author = SITE_NAME,
		tags = [],
		content,
		wordCount
	} = config;

	const ogImage = image || getOgImageUrl('article', 'article');
	const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
	const fullImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

	const structuredData: any = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: title,
		description,
		image: fullImage,
		url: fullUrl,
		datePublished: publishedTime,
		dateModified: modifiedTime || publishedTime,
		author: {
			'@type': 'Person',
			'@id': `${BASE_URL}/#person`,
			name: author
		},
		publisher: {
			'@type': 'Person',
			name: SITE_NAME,
			url: BASE_URL
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': fullUrl
		},
		inLanguage: 'en-US'
	};

	// Add keywords if tags exist
	if (tags.length > 0) {
		structuredData.keywords = tags.join(', ');
	}

	// Add word count if provided or can be calculated
	if (wordCount) {
		structuredData.wordCount = wordCount;
	} else if (content) {
		structuredData.wordCount = getWordCount(content);
	}

	// Add reading time if content is available
	if (content) {
		const readingTime = calculateReadingTime(content);
		structuredData.timeRequired = readingTime.replace(' read', '').replace(' min', 'M');
	}

	return structuredData;
}

/**
 * Generate structured data for a blog posting
 */
export function generateBlogPostingStructuredData(config: {
	title: string;
	description: string;
	url: string;
	image?: string;
	publishedTime?: string;
	modifiedTime?: string;
	author?: string;
	tags?: string[];
	content?: string;
	wordCount?: number;
}) {
	const data = generateArticleStructuredData(config);
	return {
		...data,
		'@type': 'BlogPosting'
	};
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
		}))
	};
}

/**
 * Generate ItemList structured data for a collection of items
 */
export function generateItemListStructuredData(
	items: Array<{ name: string; url: string; description?: string }>,
	listName: string
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: listName,
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			url: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
			name: item.name,
			description: item.description
		}))
	};
}

/**
 * Calculate reading time for text content
 * Average reading speed: 200-250 words per minute
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 225): string {
	const wordCount = getWordCount(text);
	const minutes = Math.ceil(wordCount / wordsPerMinute);
	return `${minutes} min read`;
}

/**
 * Get word count from text content
 */
export function getWordCount(text: string): number {
	// Remove HTML tags and normalize whitespace
	const cleanText = text
		.replace(/<[^>]*>/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	if (!cleanText) return 0;

	return cleanText.split(/\s+/).length;
}

/**
 * Extract description from content (for meta descriptions)
 */
export function extractDescription(
	content: string,
	maxLength: number = 160,
	fallback: string = ''
): string {
	// Remove HTML tags
	const text = content.replace(/<[^>]*>/g, '');

	// Get first paragraph or sentence
	const firstParagraph = text.split('\n\n')[0] || text;

	// Truncate and add ellipsis if needed
	if (firstParagraph.length <= maxLength) {
		return firstParagraph.trim();
	}

	const truncated = firstParagraph.slice(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');

	if (lastSpace > 0) {
		return truncated.slice(0, lastSpace).trim() + '...';
	}

	return truncated.trim() + '...';
}

/**
 * Format date to ISO 8601 format for structured data
 */
export function formatISODate(date: string | Date): string {
	return new Date(date).toISOString();
}

/**
 * Sanitize text for meta tags (remove HTML, trim, etc.)
 */
export function sanitizeMetaText(text: string, maxLength: number = 160): string {
	return text
		.replace(/<[^>]*>/g, '') // Remove HTML tags
		.replace(/\s+/g, ' ') // Normalize whitespace
		.trim()
		.slice(0, maxLength);
}

/**
 * Generate keywords from text or array
 */
export function generateKeywords(input: string | string[]): string {
	if (Array.isArray(input)) {
		return input.join(', ');
	}
	return input;
}

/**
 * Get canonical URL
 */
export function getCanonicalUrl(path: string): string {
	// Remove trailing slash except for root
	const cleanPath = path === '/' ? path : path.replace(/\/$/, '');
	return `${BASE_URL}${cleanPath}`;
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer
			}
		}))
	};
}

/**
 * Generate HowTo structured data
 */
export function generateHowToStructuredData(config: {
	name: string;
	description: string;
	image?: string;
	totalTime?: string;
	steps: Array<{ name: string; text: string; image?: string }>;
}) {
	const { name, description, image, totalTime, steps } = config;

	const structuredData: any = {
		'@context': 'https://schema.org',
		'@type': 'HowTo',
		name,
		description,
		step: steps.map((step, index) => ({
			'@type': 'HowToStep',
			position: index + 1,
			name: step.name,
			text: step.text,
			image: step.image
		}))
	};

	if (image) structuredData.image = image;
	if (totalTime) structuredData.totalTime = totalTime;

	return structuredData;
}

/**
 * Generate VideoObject structured data
 */
export function generateVideoStructuredData(config: {
	name: string;
	description: string;
	thumbnailUrl: string;
	uploadDate: string;
	duration?: string;
	contentUrl?: string;
	embedUrl?: string;
}) {
	const { name, description, thumbnailUrl, uploadDate, duration, contentUrl, embedUrl } = config;

	const structuredData: any = {
		'@context': 'https://schema.org',
		'@type': 'VideoObject',
		name,
		description,
		thumbnailUrl,
		uploadDate
	};

	if (duration) structuredData.duration = duration;
	if (contentUrl) structuredData.contentUrl = contentUrl;
	if (embedUrl) structuredData.embedUrl = embedUrl;

	return structuredData;
}

/**
 * Generate related content recommendations
 * Useful for internal linking
 */
export function generateRelatedContent<
	T extends { slug: string; title?: string; name?: string; tags?: string[] }
>(currentItem: T, allItems: T[], limit: number = 3): T[] {
	if (!currentItem.tags || currentItem.tags.length === 0) {
		// If no tags, return recent items
		return allItems.filter((item) => item.slug !== currentItem.slug).slice(0, limit);
	}

	// Score items based on tag overlap
	const scored = allItems
		.filter((item) => item.slug !== currentItem.slug)
		.map((item) => {
			const itemTags = item.tags || [];
			const commonTags = currentItem.tags!.filter((tag) => itemTags.includes(tag));
			return {
				item,
				score: commonTags.length
			};
		})
		.filter((scored) => scored.score > 0)
		.sort((a, b) => b.score - a.score);

	return scored.slice(0, limit).map((s) => s.item);
}

/**
 * Generate optimized image URL with parameters
 * (useful if implementing dynamic image optimization)
 */
export function getOptimizedImageUrl(
	src: string,
	options?: {
		width?: number;
		height?: number;
		quality?: number;
		format?: 'webp' | 'avif' | 'jpg' | 'png';
	}
): string {
	// For future implementation with image CDN or optimization service
	// For now, just return the original
	return src;
}

/**
 * Merge multiple structured data objects into a graph
 */
export function mergeStructuredData(...dataObjects: any[]): any {
	return {
		'@context': 'https://schema.org',
		'@graph': dataObjects
	};
}

/**
 * Generate SoftwareSourceCode structured data for projects
 */
export function generateSoftwareStructuredData(config: {
	name: string;
	description: string;
	url: string;
	codeRepository?: string;
	programmingLanguage?: string[];
	author?: string;
	dateCreated?: string;
	dateModified?: string;
}) {
	const {
		name,
		description,
		url,
		codeRepository,
		programmingLanguage,
		author,
		dateCreated,
		dateModified
	} = config;

	const structuredData: any = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareSourceCode',
		name,
		description,
		url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
		author: {
			'@type': 'Person',
			'@id': `${BASE_URL}/#person`,
			name: author || SITE_NAME
		}
	};

	if (codeRepository) {
		structuredData.codeRepository = codeRepository;
	}

	if (programmingLanguage && programmingLanguage.length > 0) {
		structuredData.programmingLanguage = programmingLanguage;
	}

	if (dateCreated) {
		structuredData.dateCreated = formatISODate(dateCreated);
	}

	if (dateModified) {
		structuredData.dateModified = formatISODate(dateModified);
	}

	return structuredData;
}

/**
 * Generate CollectionPage structured data for listing pages
 */
export function generateCollectionPageStructuredData(config: {
	name: string;
	description: string;
	url: string;
	items?: Array<{ name: string; url: string; description?: string }>;
}) {
	const { name, description, url, items = [] } = config;

	const structuredData: any = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name,
		description,
		url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
		mainEntity: {
			'@type': 'ItemList',
			itemListElement: items.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				url: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
				name: item.name,
				description: item.description
			}))
		}
	};

	return structuredData;
}

/**
 * Generate ProfilePage structured data
 */
export function generateProfilePageStructuredData(config: {
	name: string;
	description: string;
	url: string;
	image?: string;
	jobTitle?: string;
	worksFor?: string;
	sameAs?: string[];
	knowsAbout?: string[];
}) {
	const {
		name,
		description,
		url,
		image,
		jobTitle,
		worksFor,
		sameAs = [],
		knowsAbout = []
	} = config;

	const person: any = {
		'@type': 'Person',
		'@id': `${BASE_URL}/#person`,
		name,
		description,
		url: url.startsWith('http') ? url : `${BASE_URL}${url}`
	};

	if (image) {
		person.image = image.startsWith('http') ? image : `${BASE_URL}${image}`;
	}

	if (jobTitle) {
		person.jobTitle = jobTitle;
	}

	if (worksFor) {
		person.worksFor = {
			'@type': 'Organization',
			name: worksFor
		};
	}

	if (sameAs.length > 0) {
		person.sameAs = sameAs;
	}

	if (knowsAbout.length > 0) {
		person.knowsAbout = knowsAbout;
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		mainEntity: person
	};
}
