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

const DEFAULT_IMAGE = 'https://helmyl.com/images/og-default.png';
const SITE_NAME = 'Helmy Luqmanulhakim';
const TWITTER_HANDLE = '@helmyl';
const BASE_URL = 'https://helmyl.com';

/**
 * Generate comprehensive meta tags for a page
 */
export function generateMetaTags(config: SEOConfig): Record<string, string> {
	const {
		title,
		description,
		url,
		image = DEFAULT_IMAGE,
		type = 'website',
		publishedTime,
		modifiedTime,
		author,
		tags,
		section
	} = config;

	const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
	const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

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
		'twitter:creator': TWITTER_HANDLE,
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
}) {
	const {
		title,
		description,
		url,
		image = DEFAULT_IMAGE,
		publishedTime,
		modifiedTime,
		author = SITE_NAME,
		tags = []
	} = config;

	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: title,
		description,
		image: image.startsWith('http') ? image : `${BASE_URL}${image}`,
		url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
		datePublished: publishedTime,
		dateModified: modifiedTime || publishedTime,
		author: {
			'@type': 'Person',
			name: author
		},
		publisher: {
			'@type': 'Person',
			name: SITE_NAME,
			url: BASE_URL
		},
		keywords: tags.join(', '),
		inLanguage: 'en-US'
	};
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
