export interface Experience {
	date: string;
	role: string;
	company: string;
	url: string;
}

export const experience: Experience[] = [
	{
		date: 'Dec 2025 — Mar 2026',
		role: 'Scala Software Engineer',
		company: 'Ziverge (Zio)',
		url: 'https://www.ziverge.com/'
	},
	{
		date: 'Mar 2025 — Dec 2025',
		role: 'Application Developer, KlikBCABisnis',
		company: 'Bank Central Asia (BCA)',
		url: 'https://www.bca.co.id/'
	},
	{
		date: 'Jun 2025 — Oct 2025',
		role: 'DevOps Engineer',
		company: 'Prequel',
		url: 'https://www.prequel.co/'
	},
	{
		date: 'Apr 2025 — Jun 2025',
		role: 'Open Source Developer',
		company: 'GitLab',
		url: 'https://gitlab.com/'
	},
	{
		date: 'Sep 2024 — Jan 2025',
		role: 'Bangkit Machine Learning Path Cohort',
		company: 'Google, GoTo, Tokopedia, and Traveloka',
		url: 'https://grow.google/intl/id_id/bangkit/'
	},
	{
		date: 'Apr 2024 — May 2024',
		role: 'FGA PowerBI Data Analyst Cohort',
		company: 'Biji-biji Initiative',
		url: 'https://www.biji-biji.com/'
	}
];

export const skills = {
	Languages: ['Scala', 'Go', 'Python', 'Java', 'Rust', 'TypeScript'],
	Databases: ['MySQL (MariaDB)', 'PostgreSQL', 'Redis', 'MongoDB'],
	'Streaming Platforms': ['Kafka', 'RabbitMQ'],
	Containerization: ['Docker', 'Podman', 'Kubernetes'],
	'Cloud Providers': ['Google Cloud Platform', 'Microsoft Azure', 'AWS'],
	'Technical Skills': [
		'Git Conventional Commits',
		'CI/CD',
		'System Design',
		'Performance Optimization',
		'Clean Code',
		'Functional Programming'
	]
};

export const honors = [
	{
		label: 'Graduated with Distinction (Top 10%) from the Bangkit Machine Learning Path',
		url: 'https://drive.google.com/file/d/16-DJ4HaEAjrZfc3ZxnpFdzNnvZkxlDgW/view'
	},
	{
		label: 'Microsoft PL-300 PowerBI Data Analyst',
		url: 'https://learn.microsoft.com/en-us/users/helmyl/credentials/d711d303f0fd18d7?ref=https%3A%2F%2Fwww.helmyl.com%2F'
	},
	{
		label: 'Finalist of Hology Competitive Programming',
		url: 'https://drive.google.com/file/d/1skrbdOx0ZJyIEr7JBwW9PSMVRgjykd8L/view'
	}
];

export const bio =
	"Software engineer who doesn't really care what language or framework you throw at me. I'll figure it out. I like building things from scratch and making them fast.";

export const socials = [
	{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/helmyl/' },
	{ label: 'GitHub', url: 'https://github.com/elskow' },
	{ label: 'Twitter', url: 'https://twitter.com/helmy_lh' },
	{ label: 'Mail', url: 'mailto:helmyl.work@gmail.com' },
	{ label: 'Credly', url: 'https://www.credly.com/users/helmy-luqmanulhakim' }
];
