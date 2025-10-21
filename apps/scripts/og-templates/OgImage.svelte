<script lang="ts">
	export let title: string;
	export let description: string = '';
	export let type: 'article' | 'project' | 'lab' | 'default' = 'default';

	// Truncate for better display
	const displayTitle = title.length > 70 ? title.slice(0, 70) + '...' : title;
	const displayDescription =
		description && description.length > 180 ? description.slice(0, 180) + '...' : description;

	// Type label without emojis
	const typeLabel =
		type === 'article' ? 'Writing' : type === 'project' ? 'Project' : type === 'lab' ? 'Lab' : '';
</script>

<div class="og-container">
	<div class="og-content">
		<!-- Top Section - Branding -->
		<div class="og-header">
			<div class="og-brand">helmyl.com</div>
			{#if typeLabel}
				<div class="og-type">{typeLabel}</div>
			{/if}
		</div>

		<!-- Middle Section - Title & Description -->
		<div class="og-main">
			<h1 class="og-title">{displayTitle}</h1>
			{#if displayDescription}
				<p class="og-description">{displayDescription}</p>
			{/if}
		</div>

		<!-- Bottom Section - Accent Line -->
		<div class="og-footer">
			<div class="og-accent"></div>
		</div>
	</div>
</div>

<style>
	.og-container {
		display: flex;
		width: 1200px;
		height: 630px;
		background: white;
	}

	.og-content {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		padding: 80px;
		justify-content: space-between;
	}

	.og-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.og-brand {
		font-size: 28px;
		font-weight: 600;
		color: #1f2933;
		letter-spacing: -0.02em;
	}

	.og-type {
		font-size: 18px;
		color: #7b8794;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.og-main {
		display: flex;
		flex-direction: column;
		margin-top: 60px;
		margin-bottom: 60px;
	}

	.og-title {
		font-size: 64px;
		font-weight: 700;
		color: #1f2933;
		margin: 0;
		margin-bottom: 24px;
		line-height: 1.1;
		max-width: 1000px;
		letter-spacing: -0.02em;
	}

	.og-description {
		font-size: 32px;
		color: #616e7c;
		margin: 0;
		line-height: 1.4;
		max-width: 900px;
		font-weight: 400;
	}

	.og-footer {
		display: flex;
		align-items: center;
	}

	.og-accent {
		width: 120px;
		height: 4px;
		background: #1f2933;
	}
</style>
