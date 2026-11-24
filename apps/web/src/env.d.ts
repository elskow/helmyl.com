declare module 'cloudflare:workers' {
	export const env: Record<string, unknown>;
}

interface ImportMetaEnv {
	readonly GITHUB_API_TOKEN?: string;
	readonly PROD: boolean;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
