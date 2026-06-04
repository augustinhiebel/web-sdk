<script lang="ts">
	// @ts-nocheck
	import { closeIconPath } from './constants';
	import SettingsMenu from './SettingsMenu.svelte';
	import SpinButton from './SpinButton.svelte';
	import StepperButton from './StepperButton.svelte';
	import ToggleIconButton from './ToggleIconButton.svelte';

	type Props = {
		hasActiveBonus: boolean;
		showExtras: boolean;
		showWin: boolean;
		winLabel: string;
		freeSpinLabel: string;
		selectedAutobetRounds?: string | number | null;
		isIdle: boolean;
		spinIsDisabled: boolean;
		canDecreaseBet: boolean;
		canIncreaseBet: boolean;
		isAutobetOptionsOpen: boolean;
		isSettingsOpen: boolean;
		isFastModeActive: boolean;
		userBalanceLabel: string;
		selectedBet: string;
		musicVolume: number;
		soundVolume: number;
		mobileSettingsPopoverRef?: HTMLElement;
		mobileFooterBetPopoverRef?: HTMLElement;
		mobileAutobetPopoverRef?: HTMLElement;
		onBonusToggle: () => void;
		decreaseBet: () => void;
		increaseBet: () => void;
		handleSpinClick: () => void;
		handleAutobetToggle: (contextName: string, event: Event) => void;
		handleSettingsToggle: (event: Event) => void;
		handleFastModeToggle: () => void;
		toggleBetOptions: (contextName: string) => void;
		stopPropagation: (event: Event) => void;
		updateMusicVolume: (event: Event) => void;
		updateSoundVolume: (event: Event) => void;
		toggleMusicVolume: () => void;
		toggleSoundVolume: () => void;
	};

	let {
		hasActiveBonus,
		showExtras,
		showWin,
		winLabel,
		freeSpinLabel,
		selectedAutobetRounds = null,
		isIdle,
		spinIsDisabled,
		canDecreaseBet,
		canIncreaseBet,
		isAutobetOptionsOpen,
		isSettingsOpen,
		isFastModeActive,
		userBalanceLabel,
		selectedBet,
		musicVolume,
		soundVolume,
		mobileSettingsPopoverRef = $bindable(),
		mobileFooterBetPopoverRef = $bindable(),
		mobileAutobetPopoverRef = $bindable(),
		onBonusToggle,
		decreaseBet,
		increaseBet,
		handleSpinClick,
		handleAutobetToggle,
		handleSettingsToggle,
		handleFastModeToggle,
		toggleBetOptions,
		stopPropagation,
		updateMusicVolume,
		updateSoundVolume,
		toggleMusicVolume,
		toggleSoundVolume,
	}: Props = $props();
</script>

<div class="mobile-controls">
	<div class="mobile-main-row">
		<ToggleIconButton
			label="Bonus buy"
			expanded={false}
			active={hasActiveBonus}
			buttonClass="icon-button mobile-bonus-button"
			press={onBonusToggle}
		>
			{#snippet primary()}
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M16.3234 0.0866699L15.6452 9.04525H23.706L10.6766 23.9133L11.3548 14.9548H3.29402L16.3234 0.0866699Z"
				/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M2 4H9V6H2V4Z" />
				<path fill-rule="evenodd" clip-rule="evenodd" d="M3 18H9V20H3V18Z" />
				<path fill-rule="evenodd" clip-rule="evenodd" d="M0 8H4V10H0V8Z" />
			{/snippet}
			{#snippet activeIcon()}
				<path d={closeIconPath} fill="currentColor" />
			{/snippet}
		</ToggleIconButton>

		{#if showExtras}
			<div class="mobile-extras-card">
				<div>
					<span>Total win</span>
					<strong>{winLabel}</strong>
				</div>
				<div>
					<span>Free spins</span>
					<strong>{freeSpinLabel}</strong>
				</div>
			</div>
		{:else}
			<StepperButton
				label="Decrease bet amount"
				direction="decrease"
				press={decreaseBet}
				disabled={!canDecreaseBet}
				buttonClass="mobile-stepper-left"
			/>

			<div class="mobile-spin-wrap">
				<SpinButton
					{selectedAutobetRounds}
					{isIdle}
					press={handleSpinClick}
					disabled={spinIsDisabled && !selectedAutobetRounds}
				/>
			</div>

			<StepperButton
				label="Increase bet amount"
				direction="increase"
				press={increaseBet}
				disabled={!canIncreaseBet}
				buttonClass="mobile-stepper-right"
			/>
		{/if}

		<div class="mobile-icon-grid">
			<div
				role="presentation"
				bind:this={mobileAutobetPopoverRef}
				onmousedown={stopPropagation}
				ontouchstart={stopPropagation}
			>
				<ToggleIconButton
					label="Auto bet settings"
					expanded={isAutobetOptionsOpen}
					active={isAutobetOptionsOpen}
					buttonClass="mini-button"
					press={(event) => handleAutobetToggle('mobile', event)}
				>
					{#snippet primary()}
						<path
							d="M23,20V4a3,3,0,0,0-3-3H4A3,3,0,0,0,1,4V20a3,3,0,0,0,3,3H20A3,3,0,0,0,23,20ZM10.269,15.943A.5.5,0,0,1,10,15.5v-7a.5.5,0,0,1,.787-.409l5,3.5a.518.518,0,0,1,0,.818l-5,3.5A.5.5,0,0,1,10.269,15.943Z"
						/>
					{/snippet}
					{#snippet activeIcon()}
						<path d={closeIconPath} fill="currentColor" />
					{/snippet}
				</ToggleIconButton>
			</div>

			<div class="mobile-settings-cell" bind:this={mobileSettingsPopoverRef}>
				<ToggleIconButton
					label="Settings"
					expanded={isSettingsOpen}
					active={isSettingsOpen}
					buttonClass="settings-button-vertical"
					press={handleSettingsToggle}
				>
					{#snippet primary()}
						<circle cx="4" cy="4" r="3" /><circle cx="4" cy="12" r="3" /><circle
							cx="4"
							cy="20"
							r="3"
						/><path
							d="M22,2H10C9.4,2,9,2.4,9,3v2c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1V3C23,2.4,22.6,2,22,2z"
						/><path
							d="M22,10H10c-0.6,0-1,0.4-1,1v2c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1v-2C23,10.4,22.6,10,22,10z"
						/><path
							d="M22,18H10c-0.6,0-1,0.4-1,1v2c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1v-2C23,18.4,22.6,18,22,18z"
						/>
					{/snippet}
					{#snippet activeIcon()}
						<path d={closeIconPath} fill="currentColor" />
					{/snippet}
				</ToggleIconButton>
				<div
					role="presentation"
					onclick={stopPropagation}
					onmousedown={stopPropagation}
					class="settings-popover mobile-settings-popover"
					class:is-open={isSettingsOpen}
				>
					<SettingsMenu
						{musicVolume}
						{soundVolume}
						{updateMusicVolume}
						{updateSoundVolume}
						{toggleMusicVolume}
						{toggleSoundVolume}
					/>
				</div>
			</div>

			<button
				aria-label="Fast mode"
				aria-pressed={isFastModeActive}
				type="button"
				onclick={handleFastModeToggle}
				class="mini-button"
				class:is-active={isFastModeActive}
			>
				<svg viewBox="0 0 24 24">
					<path
						d="M7.35846 1L4.21744 15H9.85269L9.25347 23.8042L21.5906 8.5H14.1938L15.74 1H7.35846Z"
					/>
				</svg>
			</button>
		</div>
	</div>

	<div class="mobile-footer-row">
		<div class="label-button">
			<span>Balance</span>
			<strong>{userBalanceLabel}</strong>
		</div>
		{#if showWin && !showExtras}
			<div class="label-group label-group-win">
				<span>Total win</span>
				<strong>{winLabel}</strong>
			</div>
		{/if}
		<div
			role="presentation"
			class="mobile-bet-anchor"
			bind:this={mobileFooterBetPopoverRef}
			onmousedown={stopPropagation}
			ontouchstart={stopPropagation}
		>
			<button
				aria-label="Bet amount"
				aria-expanded={false}
				type="button"
				onclick={() => toggleBetOptions('mobileFooter')}
				class="bet-label-button"
			>
				<span>Bet</span>
				<strong class:accent-text={hasActiveBonus}>{selectedBet}</strong>
			</button>
		</div>
	</div>
</div>
