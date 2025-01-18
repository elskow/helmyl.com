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
import remarkOembed from 'remark-oembed';
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
        [rehypeMermaid, {
            strategy: 'img-svg',
            mermaidConfig: {
                theme: "dark",
                fontFamily:
                    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                fontSize: 13,
                themeVariables: {
                    /* @see: https://github.com/mermaid-js/mermaid/blob/develop/packages/mermaid/src/themes/theme-dark.js */

                    // background: '',
                    primaryColor: "#b0b0b0",
                    secondaryColor: "#545480",

                    // tertiaryColor: '',
                    primaryBorderColor: "#4c4c53",
                    // secondaryBorderColor: '',
                    // tertiaryBorderColor: '',
                    primaryTextColor: "#f4f4f5",
                    secondaryTextColor: "#f4f4f5",
                    // tertiaryTextColor: '',
                    lineColor: "#4c4c53",
                    textColor: "#f4f4f5",

                    mainBkg: "#27272a",
                    // secondBkg: '',
                    // mainContrastColor: '',
                    // darkTextColor: '',
                    // border1: '',
                    // border2: '',
                    // arrowheadColor: '',
                    // fontFamily: '',
                    fontSize: "13px",
                    // labelBackground: '',
                    // THEME_COLOR_LIMIT: 12,

                    /* Flowchart variables */
                    // nodeBkg: '',
                    nodeBorder: "#4c4c53",
                    clusterBkg: "#2e2d37",
                    clusterBorder: "#6e6580",
                    // defaultLinkColor: '',
                    titleColor: "#d4b8ef",
                    edgeLabelBackground: "#544c00",

                    /* Sequence Diagram variables */
                    actorBorder: "#4c4c53",
                    actorBkg: "#27272a",
                    actorTextColor: "#f4f4f5",
                    // actorLineColor: '',
                    signalColor: "#f4f4f5",
                    signalTextColor: "#f4f4f5",
                    labelBoxBkgColor: "#27272a",
                    labelBoxBorderColor: "#4c4c53",
                    labelTextColor: "#f4f4f5",
                    loopTextColor: "#faf#f4d701afa",
                    noteBorderColor: "#7b731a",
                    noteBkgColor: "#484826",
                    noteTextColor: "#f4d701",
                    // activationBorderColor : '',
                    // activationBkgColor : '',
                    sequenceNumberColor: "#27272a",

                    /* Git graph variables */
                    git0: "#808080",
                    git1: "#4c4c53",
                    git2: "#545480",
                    git3: "#867d80",
                    git4: "#54806f",
                    git5: "#75807d",
                    git6: "#b0b0b0",
                    git7: "#80547c",

                    // gitInv0: '',
                    // gitInv1: '',
                    // gitInv2: '',
                    // gitInv3: '',
                    // gitInv4: '',
                    // gitInv5: '',
                    // gitInv6: '',
                    // gitInv7: '',

                    gitBranchLabel0: "#f4f4f5",
                    gitBranchLabel1: "#f4f4f5",
                    gitBranchLabel2: "#f4f4f5",
                    gitBranchLabel3: "#f4f4f5",
                    gitBranchLabel4: "#f4f4f5",
                    gitBranchLabel5: "#f4f4f5",
                    gitBranchLabel6: "#f4f4f5",
                    gitBranchLabel7: "#f4f4f5",

                    tagLabelColor: "#f4d701",
                    tagLabelBackground: "#484826",
                    tagLabelBorder: "#7b731a",
                    tagLabelFontSize: "10px",
                    commitLabelColor: "#f4f4f5",
                    commitLabelBackground: "#62626a",
                    commitLabelFontSize: "10px",

                    /* State variables */
                    transitionColor: "#4c4c53",
                    // transitionLabelColor: '',
                    stateLabelColor: "#f4f4f5",
                    stateBkg: "#27272a",
                    // labelBackgroundColor: '',
                    // compositeBackground: '',
                    // altBackground: '',
                    // compositeTitleBackground: '',
                    // compositeBorder: '',
                    innerEndBackground: "#27272a",
                    specialStateColor: "#4c4c53",

                    // errorBkgColor: '',
                    // errorTextColor: '',

                    // fillType0: '',
                    // fillType1: '',
                    // fillType2: '',
                    // fillType3: '',
                    // fillType4: '',
                    // fillType5: '',
                    // fillType6: '',
                    // fillType7: '',
                },
            },
        }],
        [rehypeExpressiveCode, rehypeExpressiveCodeOptions],
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
        rehypePresetMinify
    ],
    // @ts-ignore
    remarkPlugins: [remarkGfm, [remarkOembed]],
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