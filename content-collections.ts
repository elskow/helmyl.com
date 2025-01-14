import { type Context, defineCollection, defineConfig, type Document } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import rehypeExpressiveCode from 'rehype-expressive-code';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypeMermaid from "rehype-mermaid";
import rehypeUnwrapImages from 'rehype-unwrap-images';
import readingTime from 'reading-time';
import rehypePresetMinify from 'rehype-preset-minify';
import rehypeExternalLinks from 'rehype-external-links';
import type { Pluggable } from 'unified';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

const calcLastModified = async (filePath: string, root: string) => {
    const absoluteFilePath = root + filePath;
    const { stdout } = await exec(`curl "https://api.github.com/repos/elskow/helmyl.com/commits?path=${absoluteFilePath}"`);
    if (stdout && JSON.parse(stdout).length > 0) {
        const lastCommit = JSON.parse(stdout)[0].commit.author.date;
        return new Date(lastCommit).toISOString();
    }
    return new Date().toISOString();
}

const rehypeExpressiveCodeOptions = {
    themes: ['dracula', 'catppuccin-latte'],
    plugins: [pluginCollapsibleSections()]
};

type Options = {
    allowDangerousHtml?: boolean;
    remarkPlugins?: Pluggable[];
    rehypePlugins?: Pluggable[];
};

const markdownOptions: Options = {
    rehypePlugins: [
        [rehypeKatex, { output: 'html' }],
        rehypeUnwrapImages,
        [rehypeMermaid, { strategy: 'img-png' }],
        [rehypeExpressiveCode, rehypeExpressiveCodeOptions],
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
        rehypePresetMinify
    ],
    remarkPlugins: [remarkGfm],
    allowDangerousHtml: true
};

interface PostData extends Document {
    title: string;
    date: string;
    image?: string;
    content: string;
}

const posts = defineCollection({
    name: 'posts',
    directory: 'contents/posts/',
    include: '*.md',
    schema: (z) => ({
        title: z.string(),
        date: z.string(),
        image: z.string().optional(),
    }),
    transform: async (data: PostData, context: Context) => {
        const { collection } = context;
        const root = collection.directory;
        const lastModified = await calcLastModified(data._meta.filePath, root);

        const html = await compileMarkdown(context, data, markdownOptions);

        return {
            ...data,
            slug: data._meta.filePath.replace('.md', ''),
            readTime: readingTime(data.content).text,
            lastModified,
            html: html.replace(/\/static/g, '')
        };
    }
});

interface ProjectData extends Document {
    name: string;
    description: string;
    github: string;
    stacks?: string[];
    date: string;
    priority?: number;
    content: string;
}

const projects = defineCollection({
    name: 'projects',
    directory: 'contents/projects/',
    schema: (z) => ({
        name: z.string(),
        description: z.string(),
        github: z.string(),
        stacks: z.array(z.string()).optional(),
        date: z.string(),
        priority: z.number().optional()
    }),
    include: '*.md',
    transform: async (data: ProjectData, context: Context) => {
        const { collection } = context;
        const root = collection.directory;
        const lastModified = await calcLastModified(data._meta.filePath, root);

        const html = await compileMarkdown(context, data, markdownOptions);

        return {
            ...data,
            slug: data.name.toLowerCase().replace(/ /g, '-'),
            lastModified,
            html: html.replace(/\/static/g, '')
        };
    }
});

interface UsesData extends Document {
    content: string;
}

const uses = defineCollection({
    name: 'uses',
    directory: 'contents/',
    schema: () => ({}),
    include: 'uses.md',
    transform: async (data: UsesData, context: Context) => {
        const { collection } = context;
        const root = collection.directory;
        const lastModified = await calcLastModified(data._meta.filePath, root);

        const html = await compileMarkdown(context, data, markdownOptions);

        return {
            ...data,
            lastModified,
            html: html.replace(/\/static/g, '')
        };
    }
});

interface AboutData extends Document {
    content: string;
}

const about = defineCollection({
    name: 'about',
    directory: 'contents/',
    schema: () => ({}),
    include: 'about.md',
    transform: async (data: AboutData, context: Context) => {
        const { collection } = context;
        const root = collection.directory;
        const lastModified = await calcLastModified(data._meta.filePath, root);

        const html = await compileMarkdown(context, data, markdownOptions);

        return {
            ...data,
            lastModified,
            html: html.replace(/\/static/g, '')
        };
    }
});

export default defineConfig({
    collections: [posts, projects, uses, about]
});