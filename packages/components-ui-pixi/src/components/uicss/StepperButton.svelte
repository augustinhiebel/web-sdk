<script lang="ts">
	// @ts-nocheck
	type Props = {
		label: string;
		direction: 'increase' | 'decrease';
		disabled?: boolean;
		buttonClass?: string;
		press?: (event: MouseEvent) => void;
	};

	let { label, direction, disabled = false, buttonClass = '', press }: Props = $props();
</script>

<button
	aria-label={label}
	type="button"
	onclick={(event) => press?.(event)}
	{disabled}
	class={`stepper-button ${buttonClass}`}
>
	{#if direction === 'decrease'}
		<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="4" rx="1" ry="1" /></svg>
	{:else}
		<svg viewBox="0 0 24 24">
			<path
				d="M18,10h-4V6c0-.552-.448-1-1-1h-2c-.552,0-1,.448-1,1v4H6c-.552,0-1,.448-1,1v2c0,.552,.448,1,1,1h4v4c0,.552,.448,1,1,1h2c.552,0,1-.448,1-1v-4h4c.552,0,1-.448,1-1v-2c0-.552-.448-1-1-1Z"
			/>
		</svg>
	{/if}
</button>
