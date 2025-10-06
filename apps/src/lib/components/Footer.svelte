<script context="module" lang="ts">
	const romanYear = (year: number): string => {
		const roman: { [key: string]: number } = {
			M: 1000,
			CM: 900,
			D: 500,
			CD: 400,
			C: 100,
			XC: 90,
			L: 50,
			XL: 40,
			X: 10,
			IX: 9,
			V: 5,
			IV: 4,
			I: 1
		};
		return Object.entries(roman).reduce((result, [key, value]) => {
			const tempYear = year;
			result += key.repeat(Math.floor(tempYear / value));
			year %= value;
			return result;
		}, '');
	};
</script>

<script lang="ts">
	const year: number = new Date().getFullYear();
	const roman: string = romanYear(year);
</script>

{#snippet renderFooter()}
	<footer class="max-w-4xl mx-auto md:p-8 p-4 relative z-50 bg-white dark:bg-zinc-900">
		<div class="flex flex-col items-center justify-center gap-6 pt-6">
			<p class="text-xs text-dark-500 dark:text-dark-300 md:text-sm text-center">
				© {roman} Helmy Luqmanulhakim. All rights reserved.
			</p>
			<div
				class="flex gap-8 text-xs sm:text-sm font-medium text-midnight-700 dark:text-dark-200"
			>
				<a
					class="transition-all duration-300 hover:text-azure-600 dark:hover:text-azure-400 cursor-alias relative group"
					draggable={false}
					href="https://github.com/elskow"
					target="_blank"
					title="Follow me on GitHub"
				>
					<span>GitHub</span>
					<span
						class="absolute -bottom-1 left-0 w-0 h-0.5 bg-azure-600 dark:bg-azure-400 transition-all duration-300 group-hover:w-full"
					></span>
				</a>
				<a
					class="transition-all duration-300 hover:text-azure-600 dark:hover:text-azure-400 cursor-alias relative group"
					draggable={false}
					href="https://linkedin.com/in/helmyluqman"
					target="_blank"
					title="Connect with me on LinkedIn"
				>
					<span>LinkedIn</span>
					<span
						class="absolute -bottom-1 left-0 w-0 h-0.5 bg-azure-600 dark:bg-azure-400 transition-all duration-300 group-hover:w-full"
					></span>
				</a>
				<a
					class="transition-all duration-300 hover:text-azure-600 dark:hover:text-azure-400 cursor-alias relative group"
					draggable={false}
					href="https://twitter.com/helmy_lh"
					target="_blank"
					title="Follow me on Twitter"
				>
					<span>Twitter</span>
					<span
						class="absolute -bottom-1 left-0 w-0 h-0.5 bg-azure-600 dark:bg-azure-400 transition-all duration-300 group-hover:w-full"
					></span>
				</a>
			</div>
		</div>
	</footer>
{/snippet}

{@render renderFooter()}
