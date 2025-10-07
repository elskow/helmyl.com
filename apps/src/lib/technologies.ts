import type { ComponentType } from 'svelte';

interface Technology {
	name: string;
	icons: () => Promise<{ default: ComponentType }>;
	link: string;
	accentColor: string;
}

// Lazy load icons to reduce initial bundle size
// Icons are loaded on-demand when the component is rendered

export const technologies: Technology[] = [
	{
		name: 'Go',
		icons: () => import('~icons/vscode-icons/file-type-go'),
		link: 'https://golang.org/',
		accentColor: '#00ADD8'
	},
	{
		name: 'Java',
		icons: () => import('~icons/vscode-icons/file-type-java'),
		link: 'https://www.java.com/',
		accentColor: '#ED8B00'
	},
	{
		name: 'Python',
		icons: () => import('~icons/vscode-icons/file-type-python'),
		link: 'https://www.python.org/',
		accentColor: '#3776AB'
	},
	{
		name: 'TypeScript',
		icons: () => import('~icons/vscode-icons/file-type-typescript-official'),
		link: 'https://www.typescriptlang.org/',
		accentColor: '#3178C6'
	},
	{
		name: 'Docker',
		icons: () => import('~icons/vscode-icons/file-type-docker'),
		link: 'https://www.docker.com/',
		accentColor: '#2496ED'
	},
	{
		name: 'Kubernetes',
		icons: () => import('~icons/devicon/kubernetes'),
		link: 'https://kubernetes.io/',
		accentColor: '#326CE5'
	},
	{
		name: 'Azure',
		icons: () => import('~icons/vscode-icons/file-type-azure'),
		link: 'https://azure.microsoft.com/',
		accentColor: '#0078D4'
	},
	{
		name: 'Prometheus',
		icons: () => import('~icons/vscode-icons/file-type-prometheus'),
		link: 'https://prometheus.io/',
		accentColor: '#E6522C'
	},
	{
		name: 'Grafana',
		icons: () => import('~icons/devicon/grafana'),
		link: 'https://grafana.com/',
		accentColor: '#F46800'
	},
	{
		name: 'RabbitMQ',
		icons: () => import('~icons/devicon/rabbitmq'),
		link: 'https://www.rabbitmq.com/',
		accentColor: '#FF6600'
	},
	{
		name: 'Redis',
		icons: () => import('~icons/devicon/redis'),
		link: 'https://redis.io/',
		accentColor: '#DC382D'
	},
	{
		name: 'Postgres',
		icons: () => import('~icons/vscode-icons/file-type-pgsql'),
		link: 'https://www.postgresql.org/',
		accentColor: '#336791'
	},
	{
		name: 'React',
		icons: () => import('~icons/vscode-icons/file-type-reactjs'),
		link: 'https://reactjs.org/',
		accentColor: '#61DAFB'
	},
	{
		name: 'Svelte',
		icons: () => import('~icons/vscode-icons/file-type-svelte'),
		link: 'https://svelte.dev/',
		accentColor: '#FF3E00'
	},
	{
		name: 'Spring',
		icons: () => import('~icons/devicon/spring'),
		link: 'https://spring.io/',
		accentColor: '#6DB33F'
	},
	{
		name: 'Kafka',
		icons: () => import('~icons/skill-icons/kafka'),
		link: 'https://kafka.apache.org/',
		accentColor: '#FF6600'
	}
];
