import type { Options } from '@content-collections/markdown';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginFrames } from '@expressive-code/plugin-frames';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExpressiveCode from 'rehype-expressive-code';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import rehypeMermaid from 'rehype-mermaid';
import rehypePresetMinify from 'rehype-preset-minify';
import rehypeSlug from 'rehype-slug';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import remarkGfm from 'remark-gfm';
import remarkOembed from 'remark-oembed';
import { rehypeImageCopy, rehypeSEOEnhancer } from './plugins';

if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
	process.env.PLAYWRIGHT_BROWSERS_PATH = '0';
}

const rehypeExpressiveCodeOptions = {
	themes: ['github-dark'],
	plugins: [pluginFrames(), pluginCollapsibleSections()],
	defaultProps: {
		frame: 'auto',
		showLineNumbers: true,
		wrap: true
	},
	styleOverrides: {
		borderRadius: '0.5rem',
		borderWidth: '1px',
		borderColor: 'var(--border-color, #4c4c53)',
		frames: {
			frameBoxShadowCssValue: 'none',
			tooltipSuccessBackground: '#4c7b47'
		}
	}
};

export const markdownOptions: Options = {
	rehypePlugins: [
		[rehypeKatex, { output: 'html' }],
		rehypeUnwrapImages,
		rehypeImageCopy,
		rehypeSEOEnhancer,
		rehypeSlug,
		[
			rehypeAutolinkHeadings,
			{
				behavior: 'wrap',
				properties: {
					className: ['heading-anchor'],
					ariaLabel: 'Link to section',
					style: 'color: inherit; text-decoration: none; border: none;'
				}
			}
		],
		[
			rehypeMermaid,
			{
				strategy: 'img-svg',
				launchOptions: {
					channel: 'chromium',
					headless: true
				},
				mermaidConfig: {
					theme: 'base',
					themeVariables: {
						background: '#ffffff',
						primaryColor: '#f5f5f5',
						secondaryColor: '#fafafa',

						// tertiaryColor: '',
						primaryBorderColor: '#d4d4d4',
						// secondaryBorderColor: '',
						// tertiaryBorderColor: '',
						primaryTextColor: '#111111',
						secondaryTextColor: '#262626',
						// tertiaryTextColor: '',
						lineColor: '#737373',
						textColor: '#171717',

						mainBkg: '#f5f5f5',
						// secondBkg: '',
						// mainContrastColor: '',
						darkTextColor: '#111111',
						// border1: '',
						// border2: '',
						arrowheadColor: '#525252',
						// fontFamily: '',
						fontSize: '13px',
						// labelBackground: '',
						// THEME_COLOR_LIMIT: 12,

						/* Flowchart variables */
						// nodeBkg: '',
						nodeBorder: '#d4d4d4',
						clusterBkg: '#fafafa',
						clusterBorder: '#d4d4d4',
						// defaultLinkColor: '',
						titleColor: '#111111',
						edgeLabelBackground: '#ffffff',

						/* Sequence Diagram variables */
						actorBorder: '#262626',
						actorBkg: '#262626',
						actorTextColor: '#ffffff',
						actorLineColor: '#d4d4d4',
						signalColor: '#525252',
						signalTextColor: '#171717',
						labelBoxBkgColor: '#ffffff',
						labelBoxBorderColor: '#737373',
						labelTextColor: '#171717',
						loopTextColor: '#171717',
						noteBorderColor: '#d4d4d4',
						noteBkgColor: '#fafafa',
						noteTextColor: '#171717',
						// activationBorderColor : '',
						// activationBkgColor : '',
						sequenceNumberColor: '#ffffff',

						/* Git graph variables */
						git0: '#808080',
						git1: '#4c4c53',
						git2: '#545480',
						git3: '#867d80',
						git4: '#54806f',
						git5: '#75807d',
						git6: '#b0b0b0',
						git7: '#80547c',

						// gitInv0: '',
						// gitInv1: '',
						// gitInv2: '',
						// gitInv3: '',
						// gitInv4: '',
						// gitInv5: '',
						// gitInv6: '',
						// gitInv7: '',

						gitBranchLabel0: '#f4f4f5',
						gitBranchLabel1: '#f4f4f5',
						gitBranchLabel2: '#f4f4f5',
						gitBranchLabel3: '#f4f4f5',
						gitBranchLabel4: '#f4f4f5',
						gitBranchLabel5: '#f4f4f5',
						gitBranchLabel6: '#f4f4f5',
						gitBranchLabel7: '#f4f4f5',

						tagLabelColor: '#f4d701',
						tagLabelBackground: '#484826',
						tagLabelBorder: '#7b731a',
						tagLabelFontSize: '10px',
						commitLabelColor: '#f4f4f5',
						commitLabelBackground: '#62626a',
						commitLabelFontSize: '10px',

						/* State variables */
						transitionColor: '#4c4c53',
						// transitionLabelColor: '',
						stateLabelColor: '#f4f4f5',
						stateBkg: '#27272a',
						// labelBackgroundColor: '',
						// compositeBackground: '',
						// altBackground: '',
						// compositeTitleBackground: '',
						// compositeBorder: '',
						innerEndBackground: '#27272a',
						specialStateColor: '#4c4c53'

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
					}
				}
			}
		],
		[rehypeExpressiveCode, rehypeExpressiveCodeOptions],
		[
			rehypeExternalLinks,
			{
				target: '_blank',
				rel: ['noopener', 'noreferrer'],
				properties: {
					style: 'display: inline-flex; align-items: center; flex-wrap: nowrap;'
				},
				content: {
					type: 'element',
					tagName: 'svg',
					properties: {
						xmlns: 'http://www.w3.org/2000/svg',
						width: 12,
						height: 12,
						fill: 'currentColor',
						viewBox: '0 0 16 16',
						style: 'margin-left: 0.25rem; shrink: 0;'
					},
					children: [
						{
							type: 'element',
							tagName: 'path',
							properties: {
								d: 'M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z'
							}
						},
						{
							type: 'element',
							tagName: 'path',
							properties: {
								d: 'M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z'
							}
						}
					]
				}
			}
		],
		rehypePresetMinify
	],
	// @ts-expect-error -- remark-oembed's types don't align with the plugin tuple signature
	remarkPlugins: [remarkGfm, [remarkOembed]],
	allowDangerousHtml: true
};
