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
		slug: 'bfs-maze-solver',
		name: 'BFS Maze Solver',
		description: 'OCR-ing Maze Puzzle, solve it using BFS, and wrapped as GUI Program.',
		github: 'https://github.com/elskow/BFSMazeSolver',
		stacks: ['OpenCV', 'PyQT5'],
		date: '2023-12-10',
		priority: 0
	},
	{
		slug: 'chronodir',
		name: 'Chronodir',
		description:
			'Simple cross-compiled CLI tool that creates directories with timestamp prefixes.',
		github: 'https://github.com/elskow/Chronodir',
		stacks: ['C', 'Cmake'],
		date: '2024-07-21',
		priority: 0
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
		slug: 'code-plagiarism-detector',
		name: 'Code Plagiarism Detector',
		description:
			'Backend service for detecting code plagiarism. The service uses a combination of lexical and semantic analysis to detect similarities between code snippets.',
		github: 'https://github.com/elskow/cpp-plagiarism-detector',
		stacks: ['Pygments', 'NLTK', 'FastAPI', 'Lexical Analysis'],
		date: '2023-12-01',
		priority: 0
	},
	{
		slug: 'cryptarithm-solver',
		name: 'Cryptarithm Solver',
		description: 'a lightweight solver for cryptarithm puzzle that running fully on client.',
		github: 'https://cryptarithm.helmyl.com/',
		stacks: ['Svelte', 'Tailwind CSS'],
		date: '2024-07-25',
		priority: 0
	},
	{
		slug: 'digit-recognizer-from-scratch',
		name: 'Digit Recognizer from Scratch',
		description:
			'Applying Neural Networks to recognize handwritten digits. The model is trained from scratch using Pytorch and NumPy.',
		github: 'https://github.com/elskow/DigitRecognizerFromScratch',
		stacks: ['Flask', 'Pytorch', 'Next.js', 'Tailwind CSS'],
		date: '2023-10-01',
		priority: 0
	},
	{
		slug: 'http-server-from-scratch',
		name: 'Http Server from Scratch',
		description: 'Golang net/http like api, build from scratch, for codecrafters.io challenge.',
		github: 'https://github.com/elskow/NetHttp',
		stacks: ['Go'],
		date: '2024-07-06',
		priority: 0
	},
	{
		slug: 'multilang-paraphrasing-saas',
		name: 'Multilang Paraphrasing SaaS',
		description:
			'Simple and easy to use tool for paraphasing text. It uses LLM to generate paraphrases of the input text. The tool is built using NextJs and FastAPI based on T5 model.',
		github: 'https://github.com/elskow/MultiLang-SaaS-Paraphrasing-Tool',
		stacks: ['Next.Js', 'FastAPI', 'Transformers'],
		date: '2024-04-10',
		priority: 0
	},
	{
		slug: 'nesa-judge',
		name: 'Nesa-Judge',
		description:
			'Online Judge system for basic programming assignments, built on top of DOMjudge. The system is containerized using Docker.',
		github: 'https://hub.docker.com/r/elskow/domserver-rpl',
		stacks: ['Symfony', 'Docker', 'MariaDB'],
		date: '2023-08-01',
		priority: 0
	},
	{
		slug: 'ocr-for-plate-numbers',
		name: 'OCR for Plate Numbers',
		description:
			'Training a model to recognize plate numbers from images. The model is trained using TROCR and be managed using ML-Ops tools such as Weights & Biases (Wandb).',
		github: 'https://github.com/elskow/satria_data',
		stacks: [],
		date: '2023-07-01',
		priority: 0
	},
	{
		slug: 'pinjamlab',
		name: 'PinjamLab',
		description:
			'A simple web app for borrowing and lending lab equipment. The app is built using Next.Js and TRPC for the backend.',
		github: 'https://github.com/elskow/PinjamLab',
		stacks: ['Next.Js', 'Tailwind CSS', 'TRPC', 'Prisma'],
		date: '2023-12-01',
		priority: 0
	},
	{
		slug: 'puskesmas-satisfaction-analysis',
		name: 'Puskesmas Satisfaction Analysis',
		description:
			'Analyze the citizen satisfaction of each puskesmas in Surabaya, based on Google Maps Review.',
		github: 'https://github.com/elskow/PuskesmasSbyAnalysis',
		stacks: ['Selenium (python)', 'Bi-LSTM + Attention', 'Tableau'],
		date: '2024-07-01',
		priority: 0
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
		stacks: ['Express.js', 'Google Cloud Platform', 'Go', 'ONNX Runtime', 'VowpalWabbit'],
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
