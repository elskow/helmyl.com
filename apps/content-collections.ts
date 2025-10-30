import { defineConfig } from '@content-collections/core';
import { about, posts, projects, uses } from './content-collection';

export default defineConfig({
	collections: [posts, projects, uses, about]
});
