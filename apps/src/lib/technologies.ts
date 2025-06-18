// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import VscodeIconsFileTypeJava from '~icons/vscode-icons/file-type-java';
import VscodeIconsFileTypeGo from '~icons/vscode-icons/file-type-go';
import VscodeIconsFileTypePython from '~icons/vscode-icons/file-type-python';
import VscodeIconsFileTypeTypescriptOfficial from '~icons/vscode-icons/file-type-typescript-official';
import VscodeIconsFileTypeDocker from '~icons/vscode-icons/file-type-docker';
import VscodeIconsFileTypeReactjs from '~icons/vscode-icons/file-type-reactjs';
import VscodeIconsFileTypeAzure from '~icons/vscode-icons/file-type-azure';
import VscodeIconsFileTypePgsql from '~icons/vscode-icons/file-type-pgsql';
import VscodeIconsFileTypePrometheus from '~icons/vscode-icons/file-type-prometheus';
import VscodeIconsFileTypeSvelte from '~icons/vscode-icons/file-type-svelte';
import DeviconGrafana from '~icons/devicon/grafana';
import DeviconApachekafka from '~icons/devicon/apachekafka';
import DeviconRabbitmq from '~icons/devicon/rabbitmq';
import DeviconRedis from '~icons/devicon/redis';
import DeviconSpring from '~icons/devicon/spring';
import DeviconKubernetes from '~icons/devicon/kubernetes';
import SkillIconsKafka from '~icons/skill-icons/kafka';

interface Technology {
	name: string;
	icons: any;
	link: string;
	accentColor: string;
}

export const technologies: Technology[] = [
	{
		name: 'Go',
		icons: VscodeIconsFileTypeGo,
		link: 'https://golang.org/',
		accentColor: '#00ADD8'
	},
	{
		name: 'Java',
		icons: VscodeIconsFileTypeJava,
		link: 'https://www.java.com/',
		accentColor: '#ED8B00'
	},
	{
		name: 'Python',
		icons: VscodeIconsFileTypePython,
		link: 'https://www.python.org/',
		accentColor: '#3776AB'
	},
	{
		name: 'TypeScript',
		icons: VscodeIconsFileTypeTypescriptOfficial,
		link: 'https://www.typescriptlang.org/',
		accentColor: '#3178C6'
	},
	{
		name: 'Docker',
		icons: VscodeIconsFileTypeDocker,
		link: 'https://www.docker.com/',
		accentColor: '#2496ED'
	},
	{
		name: 'Kubernetes',
		icons: DeviconKubernetes,
		link: 'https://kubernetes.io/',
		accentColor: '#326CE5'
	},
	{
		name: 'Azure',
		icons: VscodeIconsFileTypeAzure,
		link: 'https://azure.microsoft.com/',
		accentColor: '#0078D4'
	},
	{
		name: 'Prometheus',
		icons: VscodeIconsFileTypePrometheus,
		link: 'https://prometheus.io/',
		accentColor: '#E6522C'
	},
	{
		name: 'Grafana',
		icons: DeviconGrafana,
		link: 'https://grafana.com/',
		accentColor: '#F46800'
	},
	{
		name: 'RabbitMQ',
		icons: DeviconRabbitmq,
		link: 'https://www.rabbitmq.com/',
		accentColor: '#FF6600'
	},
	{
		name: 'Redis',
		icons: DeviconRedis,
		link: 'https://redis.io/',
		accentColor: '#DC382D'
	},
	{
		name: 'Postgres',
		icons: VscodeIconsFileTypePgsql,
		link: 'https://www.postgresql.org/',
		accentColor: '#336791'
	},
	{
		name: 'React',
		icons: VscodeIconsFileTypeReactjs,
		link: 'https://reactjs.org/',
		accentColor: '#61DAFB'
	},
	{
		name: 'Svelte',
		icons: VscodeIconsFileTypeSvelte,
		link: 'https://svelte.dev/',
		accentColor: '#FF3E00'
	},
	{
		name: 'Spring',
		icons: DeviconSpring,
		link: 'https://spring.io/',
		accentColor: '#6DB33F'
	},
	{
		name: 'Kafka',
		icons: SkillIconsKafka,
		link: 'https://kafka.apache.org/',
		accentColor: '#FF6600'
	}
];
