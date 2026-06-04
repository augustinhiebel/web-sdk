<script lang="ts">
	// @ts-nocheck
	import { closeIconPath } from './constants';
	import BonusConfirmationDialog from './BonusConfirmationDialog.svelte';

	type Props = {
		pricedBonusOptions: any[];
		activeBonusName?: string | null;
		pendingBonus?: any;
		bonusPriceTextClassName: string;
		userBalanceLabel: string;
		selectedBet: string;
		hasActiveBonus: boolean;
		canDecreaseBet: boolean;
		canIncreaseBet: boolean;
		bonusBetPopoverRef?: HTMLElement;
		closeBonusModal: () => void;
		openBonusConfirmation: (bonus: any) => void;
		cancelBonusConfirmation: () => void;
		cancelBonusConfirmationFromBackdrop: (event: Event) => void;
		confirmBonusAction: () => void;
		decreaseBet: () => void;
		increaseBet: () => void;
		toggleBetOptions: (contextName: string) => void;
		stopPropagation: (event: Event) => void;
	};

	let {
		pricedBonusOptions,
		activeBonusName = null,
		pendingBonus = null,
		bonusPriceTextClassName,
		userBalanceLabel,
		selectedBet,
		hasActiveBonus,
		canDecreaseBet,
		canIncreaseBet,
		bonusBetPopoverRef = $bindable(),
		closeBonusModal,
		openBonusConfirmation,
		cancelBonusConfirmation,
		cancelBonusConfirmationFromBackdrop,
		confirmBonusAction,
		decreaseBet,
		increaseBet,
		toggleBetOptions,
		stopPropagation,
	}: Props = $props();
</script>

<div class="bonus-overlay">
	<button
		aria-label="Close bonus selection"
		type="button"
		onclick={closeBonusModal}
		class="bonus-close-button"
	>
		<svg viewBox="0 0 24 24"><path d={closeIconPath} fill="currentColor" /></svg>
	</button>

	<div class="bonus-scroller">
		<div role="presentation" class="bonus-card-row" onclick={stopPropagation}>
			{#each pricedBonusOptions as bonus, itemIndex}
				{@const isBonusActive = activeBonusName === bonus.name}
				{@const isActionDisabled = bonus.isUnaffordable}
				<article
					style={`animation-delay: ${itemIndex * 0.05}s`}
					class="bonus-card"
					class:is-disabled={bonus.isUnaffordable}
				>
					<i></i>
					<div class="bonus-card-media"></div>
					<div class="bonus-card-body">
						<h3>{bonus.name}</h3>
						<p>{bonus.description}</p>
						<div class="bonus-card-action">
							<div class={`bonus-price ${bonusPriceTextClassName}`}>{bonus.priceLabel}</div>
							<button
								type="button"
								disabled={isActionDisabled}
								onclick={() => openBonusConfirmation(bonus)}
								class="bonus-action-button"
								class:activate={bonus.actionType === 'activate'}
								class:active={isBonusActive}
							>
								{#if bonus.actionType === 'activate'}
									{isBonusActive ? 'Deactivate' : 'Activate'}
								{:else}
									<span>Buy</span>
								{/if}
							</button>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>

	<div class="bonus-footer">
		<div class="bonus-balance">
			<span>Balance</span>
			<strong>{userBalanceLabel}</strong>
		</div>
		<div
			role="presentation"
			id="bonus-modal-bet-controls"
			bind:this={bonusBetPopoverRef}
			onmousedown={stopPropagation}
			ontouchstart={stopPropagation}
			class="bonus-bet-controls"
		>
			<button
				aria-label="Decrease bonus bet amount"
				type="button"
				onclick={decreaseBet}
				disabled={!canDecreaseBet}
			>
				<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="4" rx="1" ry="1" /></svg>
			</button>
			<button
				aria-label="Bet amount"
				aria-expanded={false}
				type="button"
				onclick={() => toggleBetOptions('bonusModal')}
				class="bonus-bet-label"
			>
				<span>Bet</span>
				<strong class:accent-text={hasActiveBonus}>{selectedBet}</strong>
			</button>
			<button
				aria-label="Increase bonus bet amount"
				type="button"
				onclick={increaseBet}
				disabled={!canIncreaseBet}
			>
				<svg viewBox="0 0 24 24">
					<path
						d="M18,10h-4V6c0-.552-.448-1-1-1h-2c-.552,0-1,.448-1,1v4H6c-.552,0-1,.448-1,1v2c0,.552,.448,1,1,1h4v4c0,.552,.448,1,1,1h2c.552,0,1-.448,1-1v-4h4c.552,0,1-.448,1-1v-2c0-.552-.448-1-1-1Z"
					/>
				</svg>
			</button>
		</div>
	</div>

	<BonusConfirmationDialog
		{pendingBonus}
		{activeBonusName}
		onCancel={cancelBonusConfirmation}
		onConfirm={confirmBonusAction}
		onBackdropCancel={cancelBonusConfirmationFromBackdrop}
	/>
</div>
