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
					theme: 'dark',
					themeVariables: {
						// background: '',
						primaryColor: '#b0b0b0',
						secondaryColor: '#545480',

						// tertiaryColor: '',
						primaryBorderColor: '#4c4c53',
						// secondaryBorderColor: '',
						// tertiaryBorderColor: '',
						primaryTextColor: '#f4f4f5',
						secondaryTextColor: '#f4f4f5',
						// tertiaryTextColor: '',
						lineColor: '#4c4c53',
						textColor: '#f4f4f5',

						mainBkg: '#27272a',
						// secondBkg: '',
						// mainContrastColor: '',
						// darkTextColor: '',
						// border1: '',
						// border2: '',
						// arrowheadColor: '',
						// fontFamily: '',
						fontSize: '13px',
						// labelBackground: '',
						// THEME_COLOR_LIMIT: 12,

						/* Flowchart variables */
						// nodeBkg: '',
						nodeBorder: '#4c4c53',
						clusterBkg: '#2e2d37',
						clusterBorder: '#6e6580',
						// defaultLinkColor: '',
						titleColor: '#d4b8ef',
						edgeLabelBackground: '#544c00',

						/* Sequence Diagram variables */
						actorBorder: '#4c4c53',
						actorBkg: '#27272a',
						actorTextColor: '#f4f4f5',
						// actorLineColor: '',
						signalColor: '#f4f4f5',
						signalTextColor: '#f4f4f5',
						labelBoxBkgColor: '#27272a',
						labelBoxBorderColor: '#4c4c53',
						labelTextColor: '#f4f4f5',
						loopTextColor: '#faf#f4d701afa',
						noteBorderColor: '#7b731a',
						noteBkgColor: '#484826',
						noteTextColor: '#f4d701',
						// activationBorderColor : '',
						// activationBkgColor : '',
						sequenceNumberColor: '#27272a',

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
