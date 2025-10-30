# Content Collection Modules

This directory contains modular content collection definitions for the website.

## Structure

```
content-collection/
├── README.md              # This file
├── index.ts              # Main exports
├── markdown-options.ts   # Shared markdown processing configuration
├── plugins.ts           # Custom rehype/remark plugins
├── utils.ts             # Utility functions (lastModified, etc.)
├── posts.ts             # Blog posts collection
├── projects.ts          # Projects collection
├── uses.ts              # Uses page collection
└── about.ts             # About page collection
```

## Files

### `index.ts`
Main entry point that exports all collections for use in `content-collections.ts`.

### `markdown-options.ts`
Shared configuration for markdown processing including:
- Rehype plugins (KaTeX, Mermaid, Expressive Code, etc.)
- Remark plugins (GFM, oEmbed)
- Theme configuration
- Mermaid diagram styling

### `plugins.ts`
Custom plugins for content processing:
- `rehypeImageCopy` - Copies images to static folder
- `rehypeSEOEnhancer` - Adds SEO improvements to HTML:
  - Lazy loading for images
  - Auto-generated alt text
  - External link security attributes
  - Semantic table roles
  - Code language attributes

### `utils.ts`
Utility functions:
- `calcLastModified()` - Gets last modified date from Git history or file system

### Collection Files (`posts.ts`, `projects.ts`, `uses.ts`, `about.ts`)
Individual collection definitions with their own:
- Schema definitions
- Transform functions
- Type interfaces

## Usage

To add a new collection:

1. Create a new file in this directory (e.g., `new-collection.ts`)
2. Define your collection using `defineCollection()`
3. Export it from `index.ts`
4. Add it to the config in `content-collections.ts`

Example:
```typescript
// new-collection.ts
import { defineCollection } from '@content-collections/core';
import { z } from 'zod';

export const newCollection = defineCollection({
  name: 'new-collection',
  directory: 'contents/new/',
  include: '*.md',
  schema: z.object({
    title: z.string(),
  }),
  transform: async (data, context) => {
    // Your transform logic
    return data;
  }
});

// index.ts
export { newCollection } from './new-collection';

// content-collections.ts
import { newCollection } from './content-collection';
export default defineConfig({
  collections: [..., newCollection]
});
```

## SEO Features

All collections automatically include:
- Lazy-loaded images
- Auto-generated alt text for images
- External link security attributes
- Heading anchor links (linkable sections)
- Minified HTML output
- Proper semantic HTML structure

## Maintenance

When modifying:
- **Plugins**: Edit `plugins.ts`
- **Markdown config**: Edit `markdown-options.ts`
- **Git/Date utilities**: Edit `utils.ts`
- **Individual collections**: Edit their respective files
