<script lang="ts">
	// @ts-nocheck
	import { AUTOBET_OPTIONS, closeIconPath } from './constants';

	type Props = {
		selectedAutobetRounds?: string | number | null;
		onSelect: (item: string) => void;
		onClose: () => void;
	};

	let { selectedAutobetRounds = null, onSelect, onClose }: Props = $props();
</script>

<h3 class="options-title">Autoplay rounds</h3>
<button aria-label="Close autoplay options" type="button" onclick={onClose} class="options-close-button">
	<svg viewBox="0 0 24 24"><path d={closeIconPath} fill="currentColor" /></svg>
</button>
<ul class="autobet-options-grid">
	{#each AUTOBET_OPTIONS as item}
		<li>
			<button
				type="button"
				onclick={() => onSelect(item)}
				class="autobet-choice"
				class:is-selected={selectedAutobetRounds === item}
			>
				<span>{item}</span>
			</button>
		</li>
	{/each}
</ul>
