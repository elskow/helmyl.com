export interface Project {
	slug: string;
	name: string;
	description: string;
	github: string;
	stacks: string[];
	date: string;
	priority: number;
}

export const projects: Project[] = [
	{
		slug: 'microservices-for-bank-loan-use-cases',
		name: 'Microservices for Bank Loan Use Cases',
		description:
			'This project explores the microservices architecture for Account, Card, and Loan services. It is part of a self-paced learning module focused on understanding microservices principles.',
		github: 'https://github.com/elskow/learn-microservice-k8s',
		stacks: ['Java Springboot', 'Docker', 'Kubernetes', 'Helm'],
		date: '2024-05-10',
		priority: 1
	},
	{
		slug: 'code-pair',
		name: 'Code Pair',
		description:
			'Pair to pair coding platform for developers to collaborate on coding problems and interview preparation.',
		github: 'https://github.com/elskow/codepair',
		stacks: ['GO', 'React', 'Websockets', 'WebRTC'],
		date: '2024-09-18',
		priority: 1
	},
	{
		slug: 'tonesync',
		name: 'ToneSync',
		description:
			'Smart webcam optimization tool for Hackintosh systems, enhancing video quality and color accuracy',
		github: 'https://github.com/elskow/ToneSync',
		stacks: ['Swift'],
		date: '2024-12-01',
		priority: 1
	},
	{
		slug: 'tutortoise',
		name: 'Tutortoise',
		description:
			'AI-Driven Educational platform that connects learners with tutors, with sysrec and content moderation.',
		github: 'https://github.com/tutortoise',
		stacks: ['Express.Js', 'Google Cloud Platform', 'Go', 'ONNX Runtime', 'Vowpal Wabbit'],
		date: '2024-12-10',
		priority: 1
	}
];

export const sortedProjects = [...projects].sort((a, b) => {
	if (a.priority !== b.priority) {
		return b.priority - a.priority;
	}
	return new Date(b.date).getTime() - new Date(a.date).getTime();
});
