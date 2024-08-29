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

<footer class="flex py-4 text-center sm:mt-10 mt-5">
	<div class="w-7/12 mx-auto font-semibold">
		<div class="text-sm mb-10">
			<a
				class="sm:mx-4 mb-1 sm:inline block hover:opacity-70 hover:cursor-alias"
				href="https://github.com/elskow"
				rel="noopener noreferrer"
				target="_blank"
			>
				GitHub
			</a>
			<a
				class="sm:mx-4 mb-1 sm:inline block hover:opacity-70 hover:cursor-alias"
				href="https://linkedin.com/in/helmyluqman"
				rel="noopener noreferrer"
				target="_blank"
			>
				LinkedIn
			</a>
			<a
				class="sm:mx-4 mb-1 sm:inline block hover:opacity-70 hover:cursor-alias"
				href="https://twitter.com/helmy_lh"
				rel="noopener noreferrer"
				target="_blank"
			>
				Twitter
			</a>
		</div>

		<div class="text-sm font-normal text-neutral-400">
			<p>
				© {roman}
				helmyl
			</p>
		</div>
	</div>
</footer>