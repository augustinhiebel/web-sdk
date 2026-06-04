<script lang="ts">
	// @ts-nocheck
	type Props = {
		name?: string;
		variant?: 'mobile' | 'desktop';
	};

	let { name, variant = 'mobile' }: Props = $props();
</script>

{#if variant === 'desktop'}
	<div class="desktop-active-bonus">
		<div><span class="loading-text">BONUS {name} ACTIVATED</span></div>
	</div>
{:else}
	<div class="active-bonus-banner">
		<span class="loading-text">BONUS {name} ACTIVATED</span>
	</div>
{/if}
