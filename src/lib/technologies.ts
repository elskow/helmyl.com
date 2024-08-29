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

export const technologies = [
	{ name: 'Go', icons: VscodeIconsFileTypeGo, link: 'https://golang.org/' },
	{ name: 'Java', icons: VscodeIconsFileTypeJava, link: 'https://www.java.com/' },
	{ name: 'Python', icons: VscodeIconsFileTypePython, link: 'https://www.python.org/' },
	{ name: 'TypeScript', icons: VscodeIconsFileTypeTypescriptOfficial, link: 'https://www.typescriptlang.org/' },
	{ name: 'Docker', icons: VscodeIconsFileTypeDocker, link: 'https://www.docker.com/' },
	{ name: 'Kubernetes', icons: DeviconKubernetes, link: 'https://kubernetes.io/' },
	{ name: 'Azure', icons: VscodeIconsFileTypeAzure, link: 'https://azure.microsoft.com/' },
	{ name: 'Prometheus', icons: VscodeIconsFileTypePrometheus, link: 'https://prometheus.io/' },
	{ name: 'Grafana', icons: DeviconGrafana, link: 'https://grafana.com/' },
	{ name: 'RabbitMQ', icons: DeviconRabbitmq, link: 'https://www.rabbitmq.com/' },
	{ name: 'Redis', icons: DeviconRedis, link: 'https://redis.io/' },
	{ name: 'Postgres', icons: VscodeIconsFileTypePgsql, link: 'https://www.postgresql.org/' },
	{ name: 'React', icons: VscodeIconsFileTypeReactjs, link: 'https://reactjs.org/' },
	{ name: 'Svelte', icons: VscodeIconsFileTypeSvelte, link: 'https://svelte.dev/' },
	{ name: 'Spring', icons: DeviconSpring, link: 'https://spring.io/' },
	{ name: 'Kafka', icons: DeviconApachekafka, link: 'https://kafka.apache.org/' }
];