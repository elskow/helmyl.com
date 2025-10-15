<script lang="ts">
	const year = new Date().getFullYear();

	const socials = [
		{ name: 'GitHub', href: 'https://github.com/elskow' },
		{ name: 'LinkedIn', href: 'https://linkedin.com/in/helmyl' },
		{ name: 'Twitter', href: 'https://twitter.com/helmy_lh' }
	];
</script>

<footer class="max-w-3xl mx-auto px-6 py-12 border-t border-dark-200">
	<div class="flex flex-col sm:flex-row justify-between gap-6">
		<p class="text-sm text-dark-600">
			© {year} Helmy Luqmanulhakim
		</p>

		<div class="flex gap-6">
			{#each socials as social}
				<a
					href={social.href}
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm text-dark-600 hover:text-midnight-800 transition-colors"
				>
					{social.name}
				</a>
			{/each}
		</div>
	</div>
</footer>
