export const getBreadcrumbs = () => {
	if (typeof window === 'undefined') return [];
	const path = window.location.pathname;
	const segments = path.split('/').filter(Boolean);
	return segments.map((segment, index) => {
		const url = '/' + segments.slice(0, index + 1).join('/');
		return { name: segment, url, isCurrent: index === segments.length - 1 };
	});
};