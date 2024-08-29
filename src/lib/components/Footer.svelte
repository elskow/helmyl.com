<script lang="ts">
	const year: number = new Date().getFullYear();

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
			result += key.repeat(Math.floor(year / value));
			year %= value;
			return result;
		}, '');
	};

	const roman: string = romanYear(year);
</script>

<footer class="max-w-4xl mx-auto md:p-8 p-4">
	<div
		class={`flex flex-col items-center justify-between gap-6 pt-6`}
	>
		<div class="flex gap-6 text-xs sm:text-sm font-medium text-zinc-800">
			<a
				class="transition-all duration-300 hover:font-bold hover:text-gray-400"
				href="https://github.com/elskow"
				draggable={false}
				title={'Follow me on GitHub'}
			>
				GitHub
			</a>
			<a
				class="transition-all duration-300 hover:font-bold hover:text-gray-400"
				href="https://linkedin.com/in/helmyluqman"
				draggable={false}
				title={'Connect with me on LinkedIn'}
			>
				LinkedIn
			</a>
			<a
				class="transition-all duration-300 hover:font-bold hover:text-gray-400"
				href="https://twitter.com/helmy_lh"
				draggable={false}
				title={'Follow me on Twitter'}
			>
				Twitter
			</a>
		</div>
		<p class="text-xs text-zinc-600 md:text-sm">
			© {roman}
			<a
				href="https://github.com/elskow/helmyl.com"
				class="transition-all duration-300-all duration-300 hover:text-gray-400 hover:underline"
				target="_blank"
				draggable={false}
			>
					Helmy Luqmanulhakim
			</a>
		</p>
	</div>
</footer>