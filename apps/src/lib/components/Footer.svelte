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
	<footer class="max-w-4xl mx-auto md:p-8 p-4 relative z-50 bg-white">
		<div class="flex flex-col items-center justify-center gap-6 pt-6">
			<p class="text-xs text-dark-500 md:text-sm text-center">
				© {roman} Helmy Luqmanulhakim. All rights reserved.
			</p>
			<div class="flex gap-4 text-xs sm:text-sm font-medium text-midnight-700">
				<a
					class="transition-all duration-300 hover:text-azure-600 cursor-alias relative group px-3 py-2 rounded-md hover:bg-azure-50 min-h-[44px] min-w-[44px] flex items-center justify-center focus-ring"
					draggable={false}
					href="https://github.com/elskow"
					target="_blank"
					title="Follow me on GitHub"
				>
					<span>GitHub</span>
					<span
						class="absolute -bottom-1 left-3 right-3 h-0.5 bg-azure-600 transition-all duration-300 scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100 origin-left"
					></span>
				</a>
				<a
					class="transition-all duration-300 hover:text-azure-600 cursor-alias relative group px-3 py-2 rounded-md hover:bg-azure-50 min-h-[44px] min-w-[44px] flex items-center justify-center focus-ring"
					draggable={false}
					href="https://linkedin.com/in/helmyl"
					target="_blank"
					title="Connect with me on LinkedIn"
				>
					<span>LinkedIn</span>
					<span
						class="absolute -bottom-1 left-3 right-3 h-0.5 bg-azure-600 transition-all duration-300 scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100 origin-left"
					></span>
				</a>
				<a
					class="transition-all duration-300 hover:text-azure-600 cursor-alias relative group px-3 py-2 rounded-md hover:bg-azure-50 min-h-[44px] min-w-[44px] flex items-center justify-center focus-ring"
					draggable={false}
					href="https://twitter.com/helmy_lh"
					target="_blank"
					title="Follow me on Twitter"
				>
					<span>Twitter</span>
					<span
						class="absolute -bottom-1 left-3 right-3 h-0.5 bg-azure-600 transition-all duration-300 scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100 origin-left"
					></span>
				</a>
			</div>
		</div>
	</footer>
{/snippet}

{@render renderFooter()}
