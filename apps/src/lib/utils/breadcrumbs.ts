export function getBreadcrumbs(path: string = '') {
	if (!path) return [];

	const parts = path.split('/').filter(Boolean);
	const breadcrumbs = parts.map((part, index) => {
		const url = '/' + parts.slice(0, index + 1).join('/');
		const name = part
			.replace(/-/g, ' ')
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
		const isCurrent = index === parts.length - 1;

		return {
			name,
			url,
			isCurrent
		};
	});

	return breadcrumbs;
}
