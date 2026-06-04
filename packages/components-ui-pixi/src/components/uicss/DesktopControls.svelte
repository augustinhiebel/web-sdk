<script lang="ts">
	// @ts-nocheck
	import { closeIconPath } from './constants';
	import ActiveBonusBanner from './ActiveBonusBanner.svelte';
	import SettingsMenu from './SettingsMenu.svelte';
	import SpinButton from './SpinButton.svelte';
	import ToggleIconButton from './ToggleIconButton.svelte';

	type Props = {
		hasActiveBonus: boolean;
		activeBonusName?: string;
		showWin: boolean;
		showExtras: boolean;
		winLabel: string;
		freeSpinLabel: string;
		userBalanceLabel: string;
		selectedBet: string;
		selectedAutobetRounds?: string | number | null;
		isIdle: boolean;
		spinIsDisabled: boolean;
		canDecreaseBet: boolean;
		canIncreaseBet: boolean;
		isAutobetOptionsOpen: boolean;
		isSettingsOpen: boolean;
		isFastModeActive: boolean;
		musicVolume: number;
		soundVolume: number;
		desktopSettingsPopoverRef?: HTMLElement;
		desktopFooterBetPopoverRef?: HTMLElement;
		desktopAutobetPopoverRef?: HTMLElement;
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
		activeBonusName,
		showWin,
		showExtras,
		winLabel,
		freeSpinLabel,
		userBalanceLabel,
		selectedBet,
		selectedAutobetRounds = null,
		isIdle,
		spinIsDisabled,
		canDecreaseBet,
		canIncreaseBet,
		isAutobetOptionsOpen,
		isSettingsOpen,
		isFastModeActive,
		musicVolume,
		soundVolume,
		desktopSettingsPopoverRef = $bindable(),
		desktopFooterBetPopoverRef = $bindable(),
		desktopAutobetPopoverRef = $bindable(),
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

<div class="desktop-controls">
	{#if hasActiveBonus}
		<ActiveBonusBanner variant="desktop" name={activeBonusName} />
	{/if}

	<div class="desktop-settings-wrap" bind:this={desktopSettingsPopoverRef}>
		<ToggleIconButton
			label="Settings"
			expanded={isSettingsOpen}
			active={isSettingsOpen}
			buttonClass="glass-button settings-square"
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
			class="settings-popover desktop-settings-popover"
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

	<ToggleIconButton
		label="Bonus buy"
		expanded={false}
		active={hasActiveBonus}
		buttonClass="glass-button bonus-square"
		press={onBonusToggle}
	>
		{#snippet primary()}
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M16.3234 0.0866699L15.6452 9.04525H23.706L10.6766 23.9133L11.3548 14.9548H3.29402L16.3234 0.0866699Z"
			/><path fill-rule="evenodd" clip-rule="evenodd" d="M2 4H9V6H2V4Z" /><path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M3 18H9V20H3V18Z"
			/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 8H4V10H0V8Z" />
		{/snippet}
		{#snippet activeIcon()}
			<path d={closeIconPath} fill="currentColor" />
		{/snippet}
	</ToggleIconButton>

	<div class="desktop-info-bar">
		<i class="spin-cutout"></i>
		<div class="info-content">
			<div class="label-button">
				<span>Balance</span>
				<strong>{userBalanceLabel}</strong>
			</div>
			{#if showWin}
				<div class="label-group label-group-win">
					<span>Total win</span>
					<strong>{winLabel}</strong>
				</div>
			{/if}
			{#if showExtras}
				<div class="label-group">
					<span>Free spins</span>
					<strong>{freeSpinLabel}</strong>
				</div>
			{/if}
			<div
				role="presentation"
				class="desktop-bet-anchor"
				bind:this={desktopFooterBetPopoverRef}
				onmousedown={stopPropagation}
				ontouchstart={stopPropagation}
			>
				<button
					aria-label="Bet amount"
					aria-expanded={false}
					type="button"
					onclick={() => toggleBetOptions('desktopFooter')}
					class="bet-label-button"
				>
					<span>Bet</span>
					<strong class:accent-text={hasActiveBonus}>{selectedBet}</strong>
				</button>
				<div class="desktop-bet-steppers">
					<button
						aria-label="Increase bet amount"
						type="button"
						onclick={increaseBet}
						disabled={!canIncreaseBet}
					>
						<svg viewBox="0 0 24 24">
							<path
								d="M16.707,13.293l-4-4a1,1,0,0,0-1.414,0l-4,4a1,1,0,1,0,1.414,1.414L12,11.414l3.293,3.293a1,1,0,0,0,1.414-1.414Z"
							/>
						</svg>
					</button>
					<button
						aria-label="Decrease bet amount"
						type="button"
						onclick={decreaseBet}
						disabled={!canDecreaseBet}
					>
						<svg viewBox="0 0 24 24">
							<path
								d="M12,15a1,1,0,0,1-.707-.293l-4-4A1,1,0,1,1,8.707,9.293L12,12.586l3.293-3.293a1,1,0,0,1,1.414,1.414l-4,4A1,1,0,0,1,12,15Z"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<div class="desktop-spin-slot">
			<SpinButton
				{selectedAutobetRounds}
				{isIdle}
				press={handleSpinClick}
				disabled={spinIsDisabled && !selectedAutobetRounds}
				buttonClass="desktop-spin-button"
			/>
		</div>
	</div>

	<div class="desktop-side-actions">
		<div
			role="presentation"
			bind:this={desktopAutobetPopoverRef}
			onmousedown={stopPropagation}
			ontouchstart={stopPropagation}
		>
			<ToggleIconButton
				label="Auto bet settings"
				expanded={isAutobetOptionsOpen}
				active={isAutobetOptionsOpen}
				buttonClass="mini-button desktop-mini-button"
				press={(event) => handleAutobetToggle('desktop', event)}
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
		<button
			aria-label="Fast mode"
			aria-pressed={isFastModeActive}
			type="button"
			onclick={handleFastModeToggle}
			class="mini-button desktop-mini-button"
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
