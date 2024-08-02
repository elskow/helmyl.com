import { BiLogoGoLang, BiLogoJava, BiLogoPython, BiLogoTypescript } from 'react-icons/bi'
import { FaDocker, FaReact } from 'react-icons/fa'
import {
    SiApachekafka,
    SiGrafana,
    SiLinux,
    SiMicrosoftazure,
    SiPostgresql,
    SiPowerbi,
    SiPrometheus,
    SiRabbitmq,
    SiRedis,
    SiSpring,
    SiSvelte,
} from 'react-icons/si'

type Skill = {
    Icon: React.ElementType
    link: string
    text: string
}

const Skills: Skill[] = [
    { Icon: BiLogoGoLang, link: 'https://golang.org/', text: 'GoLang' },
    { Icon: BiLogoJava, link: 'https://www.java.com/', text: 'Java' },
    { Icon: BiLogoPython, link: 'https://www.python.org/', text: 'Python' },
    { Icon: BiLogoTypescript, link: 'https://www.typescriptlang.org/', text: 'TypeScript' },
    { Icon: FaReact, link: 'https://reactjs.org/', text: 'React' },
    { Icon: SiSvelte, link: 'https://svelte.dev/', text: 'Svelte' },
    { Icon: SiSpring, link: 'https://spring.io/', text: 'Spring' },
    { Icon: SiApachekafka, link: 'https://kafka.apache.org/', text: 'Apache Kafka' },
    { Icon: SiRabbitmq, link: 'https://www.rabbitmq.com/', text: 'RabbitMQ' },
    { Icon: SiRedis, link: 'https://redis.io/', text: 'Redis' },
    { Icon: SiPostgresql, link: 'https://www.postgresql.org/', text: 'PostgreSQL' },
    { Icon: SiLinux, link: 'https://www.linux.org/', text: 'Linux' },
    { Icon: SiMicrosoftazure, link: 'https://azure.microsoft.com/', text: 'Microsoft Azure' },
    { Icon: FaDocker, link: 'https://www.docker.com/', text: 'Docker' },
    { Icon: SiGrafana, link: 'https://grafana.com/', text: 'Grafana' },
    { Icon: SiPrometheus, link: 'https://prometheus.io/', text: 'Prometheus' },
    { Icon: SiPowerbi, link: 'https://powerbi.microsoft.com/', text: 'Power BI' },
]

export default Skills
