<script lang="ts">
	// @ts-nocheck
	import { BET_OPTIONS, closeIconPath } from './constants';

	type Props = {
		selectedBet: string;
		gridClassName: string;
		onSelect: (item: string) => void;
		onClose: () => void;
	};

	let { selectedBet, gridClassName, onSelect, onClose }: Props = $props();
</script>

<h3 class="options-title">Bet amount</h3>
<button aria-label="Close bet options" type="button" onclick={onClose} class="options-close-button">
	<svg viewBox="0 0 24 24"><path d={closeIconPath} fill="currentColor" /></svg>
</button>
<ul class={`bet-options-grid ${gridClassName}`}>
	{#each BET_OPTIONS as item}
		<li>
			<button
				type="button"
				onclick={() => onSelect(item)}
				class="option-choice"
				class:is-selected={selectedBet === item}
			>
				<span>{item}</span>
			</button>
		</li>
	{/each}
</ul>
