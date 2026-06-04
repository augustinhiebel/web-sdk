<script lang="ts">
	// @ts-nocheck
	import type { Snippet } from 'svelte';

	type Props = {
		open: boolean;
		layout: any;
		panelRef?: HTMLElement;
		onClose: () => void;
		stopPropagation: (event: Event) => void;
		children: Snippet;
	};

	let { open, layout, panelRef = $bindable(), onClose, stopPropagation, children }: Props =
		$props();
</script>

{#if layout.mode === 'modal'}
	<div role="presentation" class="option-modal" class:is-open={open} onclick={onClose}>
		<div
			role="presentation"
			bind:this={panelRef}
			onclick={stopPropagation}
			style={`width: ${layout.width}px; max-height: ${layout.maxHeight}px;`}
			class="options-panel"
		>
			{@render children()}
		</div>
	</div>
{:else}
	<div role="presentation" class="option-modal mobile-only-modal" class:is-open={open} onclick={onClose}>
		<div role="presentation" onclick={stopPropagation} class="options-panel">
			{@render children()}
		</div>
	</div>
	<div
		bind:this={panelRef}
		style={`left: ${layout.left}px; top: ${layout.top}px; width: ${layout.width}px; max-height: ${layout.maxHeight}px; transform-origin: ${layout.transformOrigin}; visibility: ${open && !layout.isPositionReady ? 'hidden' : 'visible'};`}
		class="options-panel anchored-options-panel"
		class:is-open={open && layout.isPositionReady}
		class:is-measuring={open && !layout.isPositionReady}
	>
		{@render children()}
	</div>
{/if}
