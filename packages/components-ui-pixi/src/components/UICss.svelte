<script lang="ts">
	// @ts-nocheck
	import { onMount, tick } from 'svelte';
	import { stateBet, stateBetDerived, stateSound, stateUi } from 'state-shared';

	import { getContext } from '../context';
	import type { EmitterEventUi } from '../types';
	import ActiveBonusBanner from './uicss/ActiveBonusBanner.svelte';
	import AutobetOptionsPanel from './uicss/AutobetOptionsPanel.svelte';
	import BetOptionsPanel from './uicss/BetOptionsPanel.svelte';
	import BonusBuyModal from './uicss/BonusBuyModal.svelte';
	import DesktopControls from './uicss/DesktopControls.svelte';
	import MobileControls from './uicss/MobileControls.svelte';
	import OptionsOverlay from './uicss/OptionsOverlay.svelte';
	import './uicss/styles.css';
	import { BET_OPTIONS, BONUS_OPTIONS, FALLBACK_USER_BALANCE } from './uicss/constants';
	import {
		formatCurrencyValue as formatCurrency,
		getAdaptivePopoverLayout,
		getGameBoundsSnapshot,
		getLocalAnchorRect,
		parseCurrencyValue,
	} from './uicss/helpers';

	type Props = {
		balance?: string;
		win?: string;
		bet?: string;
		currency?: string;
		showWin?: boolean;
		showExtras?: boolean;
		menuOpen?: boolean;
		betOptionsOpen?: boolean;
		autobetOptionsOpen?: boolean;
		bonusModalOpen?: boolean;
		bonusConfirmationOpen?: boolean;
		autoSpinCount?: string | number | null;
		autoSpinActive?: boolean;
		turboActive?: boolean;
		bonusActive?: boolean;
		disabled?: boolean;
		layout?: 'auto' | 'mobile' | 'desktop';
	};

	let {
		balance,
		win,
		bet,
		currency,
		showWin: showWinProp,
		showExtras: showExtrasProp,
		menuOpen,
		betOptionsOpen = false,
		autobetOptionsOpen = false,
		bonusModalOpen = false,
		bonusConfirmationOpen = false,
		autoSpinCount,
		autoSpinActive,
		turboActive,
		bonusActive,
		disabled,
		layout = 'auto',
	}: Props = $props();

	const context = getContext();
	const broadcast = (event: EmitterEventUi) => context.eventEmitter?.broadcast(event);
	const formatCurrencyValue = (value) =>
		formatCurrency(value, currency ?? stateBet.currency ?? 'USD');

	let musicVolume = $state(stateSound.volumeValueMusic);
	let soundVolume = $state(stateSound.volumeValueSoundEffect);
	let previousMusicVolume = $state(stateSound.volumeValueMusic || 50);
	let previousSoundVolume = $state(stateSound.volumeValueSoundEffect || 50);
	let selectedBet = $state(bet ?? formatCurrencyValue(stateBet.betAmount || 1));
	let isSettingsOpen = $state(menuOpen ?? false);
	let isBetOptionsOpen = $state(betOptionsOpen);
	let isAutobetOptionsOpen = $state(autobetOptionsOpen);
	let selectedAutobetRounds = $state(
		autoSpinCount ?? (autoSpinActive ? stateUi.autoSpinsText : null),
	);
	let isFastModeActive = $state(turboActive ?? stateBet.isTurbo);
	let isBonusModalOpen = $state(bonusModalOpen || bonusConfirmationOpen);
	let pendingBonus = $state(null);
	let activeBonusName = $state(bonusActive ? BONUS_OPTIONS[0].name : null);
	let purchasedBonusNames = $state([]);
	let showExtras = $state(showExtrasProp ?? false);
	let showWin = $state(showWinProp ?? stateBet.winBookEventAmount > 0);
	let gameBounds = $state({ width: 0, height: 0, left: 0, top: 0 });
	let popoverAnchorRects = $state({ bet: null, autobet: null });
	let popoverPanelSizes = $state({ bet: null, autobet: null });
	let activeBetPopoverContext = $state('footer');
	let activeAutobetPopoverContext = $state('desktop');
	let stopDisabled = $state(false);

	let gameRef = $state();
	let mobileSettingsPopoverRef = $state();
	let desktopSettingsPopoverRef = $state();
	let mobileFooterBetPopoverRef = $state();
	let desktopFooterBetPopoverRef = $state();
	let bonusBetPopoverRef = $state();
	let mobileAutobetPopoverRef = $state();
	let desktopAutobetPopoverRef = $state();
	let betOptionsPopoverRef = $state();
	let autobetOptionsPopoverRef = $state();

	const selectedBetIndex = $derived(BET_OPTIONS.indexOf(selectedBet));
	const selectedBetValue = $derived(parseCurrencyValue(selectedBet));
	const userBalanceValue = $derived(stateBet.balanceAmount || FALLBACK_USER_BALANCE);
	const userBalanceLabel = $derived(
		balance ?? formatCurrencyValue(userBalanceValue).replace('.00', ''),
	);
	const winLabel = $derived(win ?? formatCurrencyValue(stateBet.winBookEventAmount || 143));
	const freeSpinLabel = $derived(
		`${stateUi.freeSpinCounterCurrent || 1}/${stateUi.freeSpinCounterTotal || 4}`,
	);
	const canDecreaseBet = $derived(selectedBetIndex > 0);
	const canIncreaseBet = $derived(
		selectedBetIndex > -1 && selectedBetIndex < BET_OPTIONS.length - 1,
	);
	const activeBonus = $derived(BONUS_OPTIONS.find((bonus) => bonus.name === activeBonusName));
	const hasActiveBonus = $derived(activeBonusName !== null);
	const isIdle = $derived(context.stateXstateDerived?.isIdle?.() ?? true);
	const spinIsDisabled = $derived(
		isIdle ? (disabled ?? !stateBetDerived.isBetCostAvailable()) : stopDisabled,
	);
	const pricedBonusOptions = $derived.by(() =>
		BONUS_OPTIONS.map((bonus) => {
			const priceValue = selectedBetValue * bonus.multiplier;
			const isBonusActive = activeBonusName === bonus.name;
			const isBonusPurchased = purchasedBonusNames.includes(bonus.name);
			const actionType =
				bonus.actionType === 'buy' && isBonusPurchased ? 'activate' : bonus.actionType;

			return {
				...bonus,
				actionType,
				priceValue,
				priceLabel: formatCurrencyValue(priceValue),
				isUnaffordable:
					priceValue > userBalanceValue && !isBonusActive && actionType !== 'activate',
			};
		}),
	);
	const longestBonusPriceLength = $derived(
		Math.max(...pricedBonusOptions.map((bonus) => bonus.priceLabel.length)),
	);
	const bonusPriceTextClassName = $derived(
		longestBonusPriceLength > 12
			? 'bonus-price-small'
			: longestBonusPriceLength > 9
				? 'bonus-price-medium'
				: 'bonus-price-large',
	);
	const betLayout = $derived(
		getAdaptivePopoverLayout({
			anchorRect: popoverAnchorRects.bet,
			panelSize: popoverPanelSizes.bet,
			boundsSize: gameBounds,
			preferredAlignment: 'right',
			preferredWidth: 640,
			compactWidth: 480,
			maxHeight: 560,
		}),
	);
	const autobetLayout = $derived(
		getAdaptivePopoverLayout({
			anchorRect: popoverAnchorRects.autobet,
			panelSize: popoverPanelSizes.autobet,
			boundsSize: gameBounds,
			preferredAlignment: 'right',
			preferredWidth: 464,
			compactWidth: 360,
			maxHeight: 448,
			forceModalWhenConstrained: true,
		}),
	);
	const betGridClassName = $derived(
		betLayout.mode === 'modal' || betLayout.gridColumns === 'compact'
			? 'bet-grid-compact'
			: 'bet-grid-wide',
	);

	function updateMusicVolume(event) {
		const nextVolume = Number(event.target.value);
		musicVolume = nextVolume;
		stateSound.volumeValueMusic = nextVolume;
		if (nextVolume > 0) previousMusicVolume = nextVolume;
	}

	function updateSoundVolume(event) {
		const nextVolume = Number(event.target.value);
		soundVolume = nextVolume;
		stateSound.volumeValueSoundEffect = nextVolume;
		if (nextVolume > 0) previousSoundVolume = nextVolume;
	}

	function toggleMusicVolume() {
		if (musicVolume > 0) {
			previousMusicVolume = musicVolume;
			musicVolume = 0;
			stateSound.volumeValueMusic = 0;
			return;
		}
		musicVolume = previousMusicVolume;
		stateSound.volumeValueMusic = previousMusicVolume;
	}

	function toggleSoundVolume() {
		if (soundVolume > 0) {
			previousSoundVolume = soundVolume;
			soundVolume = 0;
			stateSound.volumeValueSoundEffect = 0;
			stateSound.volumeValueMaster = 0;
			return;
		}
		soundVolume = previousSoundVolume;
		stateSound.volumeValueSoundEffect = previousSoundVolume;
		stateSound.volumeValueMaster = Math.max(stateSound.volumeValueMaster, 50);
	}

	function setBetFromLabel(value) {
		selectedBet = value;
		const parsedValue = parseCurrencyValue(value);
		if (Number.isFinite(parsedValue)) stateBetDerived.setBetAmount(parsedValue);
	}

	function increaseBet() {
		if (!canIncreaseBet) return;
		setBetFromLabel(BET_OPTIONS[selectedBetIndex + 1]);
	}

	function decreaseBet() {
		if (!canDecreaseBet) return;
		setBetFromLabel(BET_OPTIONS[selectedBetIndex - 1]);
	}

	function selectBetOption(item) {
		setBetFromLabel(item);
		isBetOptionsOpen = false;
	}

	function selectAutobetOption(option) {
		selectedAutobetRounds = option;
		stateUi.autoSpinsText = option;
		isAutobetOptionsOpen = false;
	}

	function stopAutobet() {
		selectedAutobetRounds = null;
		stateBet.autoSpinsCounter = 0;
	}

	function handleSpinClick() {
		broadcast({ type: 'soundPressBet' });

		if (selectedAutobetRounds) {
			stopAutobet();
			return;
		}

		if (isIdle) {
			if (stateBetDerived.activeBetMode()?.type === 'buy') stateBet.activeBetModeKey = 'BASE';
			broadcast({ type: 'bet' });
			showWin = !showWin;
			return;
		}

		if (spinIsDisabled) return;
		if (stateBetDerived.hasAutoBetCounter()) stateBet.autoSpinsCounter = 0;
		broadcast({ type: 'stopButtonClick' });
	}

	function handleBonusToggle() {
		if (hasActiveBonus) {
			activeBonusName = null;
			stateBet.activeBetModeKey = 'BASE';
			closeBonusModal();
			return;
		}
		if (isBonusModalOpen) {
			closeBonusModal();
			return;
		}
		openBonusModal();
	}

	function openBonusModal() {
		isBonusModalOpen = true;
		isSettingsOpen = false;
		isBetOptionsOpen = false;
		isAutobetOptionsOpen = false;
	}

	function closeBonusModal() {
		isBonusModalOpen = false;
		pendingBonus = null;
		isBetOptionsOpen = false;
		isAutobetOptionsOpen = false;
	}

	function openBonusConfirmation(bonus) {
		pendingBonus = bonus;
		isBetOptionsOpen = false;
		isAutobetOptionsOpen = false;
	}

	function cancelBonusConfirmation() {
		pendingBonus = null;
	}

	function cancelBonusConfirmationFromBackdrop(event) {
		if (event.target === event.currentTarget) cancelBonusConfirmation();
	}

	function confirmBonusAction() {
		if (!pendingBonus) return;

		if (pendingBonus.actionType === 'activate') {
			const isSameBonus = activeBonusName === pendingBonus.name;
			activeBonusName = isSameBonus ? null : pendingBonus.name;
			stateBet.activeBetModeKey = isSameBonus ? 'BASE' : pendingBonus.betModeKey;
			closeBonusModal();
		}

		if (pendingBonus.actionType === 'buy') {
			if (!purchasedBonusNames.includes(pendingBonus.name)) {
				purchasedBonusNames = [...purchasedBonusNames, pendingBonus.name];
			}
			stateBet.activeBetModeKey = pendingBonus.betModeKey;
			closeBonusModal();
		}

		pendingBonus = null;
	}

	function getBetAnchorRef(contextName) {
		if (contextName === 'bonusModal') return bonusBetPopoverRef;
		if (contextName === 'mobileFooter') return mobileFooterBetPopoverRef;
		return desktopFooterBetPopoverRef;
	}

	function getAutobetAnchorRef(contextName) {
		return contextName === 'mobile' ? mobileAutobetPopoverRef : desktopAutobetPopoverRef;
	}

	async function toggleBetOptions(contextName = 'footer') {
		const shouldOpen = activeBetPopoverContext !== contextName || !isBetOptionsOpen;
		activeBetPopoverContext = contextName;
		isSettingsOpen = false;
		isAutobetOptionsOpen = false;

		if (!shouldOpen) {
			isBetOptionsOpen = false;
			return;
		}

		popoverPanelSizes = { ...popoverPanelSizes, bet: null };
		isBetOptionsOpen = true;
		await syncPopoverLayout();
	}

	async function toggleAutobetOptions(contextName = 'desktop') {
		const shouldOpen = activeAutobetPopoverContext !== contextName || !isAutobetOptionsOpen;
		activeAutobetPopoverContext = contextName;
		isSettingsOpen = false;
		isBetOptionsOpen = false;

		if (!shouldOpen) {
			isAutobetOptionsOpen = false;
			return;
		}

		popoverPanelSizes = { ...popoverPanelSizes, autobet: null };
		isAutobetOptionsOpen = true;
		await syncPopoverLayout();
	}

	async function syncPopoverLayout() {
		await tick();
		updatePopoverMetrics();
		await tick();
		measurePopoverPanels();
		await tick();
		updatePopoverMetrics();
	}

	function updatePopoverMetrics() {
		const nextGameBounds = getGameBoundsSnapshot(gameRef);
		gameBounds = nextGameBounds;
		popoverAnchorRects = {
			bet: getLocalAnchorRect(getBetAnchorRef(activeBetPopoverContext), nextGameBounds),
			autobet: getLocalAnchorRect(getAutobetAnchorRef(activeAutobetPopoverContext), nextGameBounds),
		};
	}

	function getPanelSize(panelRef) {
		if (!panelRef) return null;
		const panelRect = panelRef.getBoundingClientRect();
		return {
			width: panelRef.offsetWidth || panelRect.width,
			height: panelRef.offsetHeight || panelRect.height,
		};
	}

	function measurePopoverPanels() {
		popoverPanelSizes = {
			bet: isBetOptionsOpen ? getPanelSize(betOptionsPopoverRef) : popoverPanelSizes.bet,
			autobet: isAutobetOptionsOpen
				? getPanelSize(autobetOptionsPopoverRef)
				: popoverPanelSizes.autobet,
		};
	}

	function hideFloatingControls() {
		isSettingsOpen = false;
		isBetOptionsOpen = false;
		isAutobetOptionsOpen = false;
	}

	function handleDocumentClick(event) {
		const target = event.target;
		const refs = [
			mobileSettingsPopoverRef,
			desktopSettingsPopoverRef,
			mobileFooterBetPopoverRef,
			desktopFooterBetPopoverRef,
			bonusBetPopoverRef,
			mobileAutobetPopoverRef,
			desktopAutobetPopoverRef,
			betOptionsPopoverRef,
			autobetOptionsPopoverRef,
		];

		if (refs.some((ref) => ref?.contains(target))) return;
		hideFloatingControls();
	}

	function handleKeyDown(event) {
		if (event.key !== 'Escape') return;
		isBetOptionsOpen = false;
		isAutobetOptionsOpen = false;
		if (!isBonusModalOpen) return;
		closeBonusModal();
	}

	function stopPropagation(event) {
		event.stopPropagation();
	}

	function handleSettingsToggle(event) {
		event?.stopPropagation();
		broadcast({ type: 'soundPressGeneral' });
		isSettingsOpen = !isSettingsOpen;
		isBetOptionsOpen = false;
		isAutobetOptionsOpen = false;
	}

	function handleAutobetToggle(contextName, event) {
		event?.stopPropagation();
		broadcast({ type: 'soundPressGeneral' });
		toggleAutobetOptions(contextName);
	}

	function handleFastModeToggle() {
		isFastModeActive = !isFastModeActive;
		stateBetDerived.updateIsTurbo(isFastModeActive, { persistent: true });
		broadcast({ type: 'soundPressGeneral' });
	}

	onMount(() => {
		if (bonusConfirmationOpen) pendingBonus = pricedBonusOptions[0];

		const params = new URLSearchParams(window.location.search);
		if (params.has('showExtras')) showExtras = params.get('showExtras') === 'true';
		if (params.has('showWin')) showWin = params.get('showWin') === 'true';

		const handleViewportChange = () => {
			updatePopoverMetrics();
			window.requestAnimationFrame(measurePopoverPanels);
		};

		updatePopoverMetrics();
		if (isBetOptionsOpen || isAutobetOptionsOpen) {
			syncPopoverLayout();
		}
		window.addEventListener('resize', handleViewportChange);
		window.addEventListener('orientationchange', handleViewportChange);
		window.visualViewport?.addEventListener('resize', handleViewportChange);
		window.visualViewport?.addEventListener('scroll', handleViewportChange);
		document.addEventListener('click', handleDocumentClick, true);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('resize', handleViewportChange);
			window.removeEventListener('orientationchange', handleViewportChange);
			window.visualViewport?.removeEventListener('resize', handleViewportChange);
			window.visualViewport?.removeEventListener('scroll', handleViewportChange);
			document.removeEventListener('click', handleDocumentClick, true);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	context.eventEmitter?.subscribeOnMount({
		stopButtonClick: () => (stopDisabled = true),
		stopButtonEnable: () => (stopDisabled = false),
	});
</script>

<div
	class="ui-root"
	class:ui-compact={layout === 'mobile'}
	class:ui-desktop-lock={layout === 'desktop'}
	bind:this={gameRef}
>
	{#if hasActiveBonus}
		<ActiveBonusBanner name={activeBonus?.name} />
	{/if}

	<div id="controls" class="controls">
		<MobileControls
			{hasActiveBonus}
			{showExtras}
			{showWin}
			{winLabel}
			{freeSpinLabel}
			{selectedAutobetRounds}
			{isIdle}
			{spinIsDisabled}
			{canDecreaseBet}
			{canIncreaseBet}
			{isAutobetOptionsOpen}
			{isSettingsOpen}
			{isFastModeActive}
			{userBalanceLabel}
			{selectedBet}
			{musicVolume}
			{soundVolume}
			bind:mobileSettingsPopoverRef
			bind:mobileFooterBetPopoverRef
			bind:mobileAutobetPopoverRef
			onBonusToggle={handleBonusToggle}
			{decreaseBet}
			{increaseBet}
			{handleSpinClick}
			{handleAutobetToggle}
			{handleSettingsToggle}
			{handleFastModeToggle}
			{toggleBetOptions}
			{stopPropagation}
			{updateMusicVolume}
			{updateSoundVolume}
			{toggleMusicVolume}
			{toggleSoundVolume}
		/>

		<DesktopControls
			{hasActiveBonus}
			activeBonusName={activeBonus?.name}
			{showWin}
			{showExtras}
			{winLabel}
			{freeSpinLabel}
			{userBalanceLabel}
			{selectedBet}
			{selectedAutobetRounds}
			{isIdle}
			{spinIsDisabled}
			{canDecreaseBet}
			{canIncreaseBet}
			{isAutobetOptionsOpen}
			{isSettingsOpen}
			{isFastModeActive}
			{musicVolume}
			{soundVolume}
			bind:desktopSettingsPopoverRef
			bind:desktopFooterBetPopoverRef
			bind:desktopAutobetPopoverRef
			onBonusToggle={handleBonusToggle}
			{decreaseBet}
			{increaseBet}
			{handleSpinClick}
			{handleAutobetToggle}
			{handleSettingsToggle}
			{handleFastModeToggle}
			{toggleBetOptions}
			{stopPropagation}
			{updateMusicVolume}
			{updateSoundVolume}
			{toggleMusicVolume}
			{toggleSoundVolume}
		/>
	</div>

	<OptionsOverlay
		open={isBetOptionsOpen}
		layout={betLayout}
		bind:panelRef={betOptionsPopoverRef}
		onClose={() => (isBetOptionsOpen = false)}
		{stopPropagation}
	>
		{#snippet children()}
			<BetOptionsPanel
				{selectedBet}
				gridClassName={betGridClassName}
				onSelect={selectBetOption}
				onClose={() => (isBetOptionsOpen = false)}
			/>
		{/snippet}
	</OptionsOverlay>

	<OptionsOverlay
		open={isAutobetOptionsOpen}
		layout={autobetLayout}
		bind:panelRef={autobetOptionsPopoverRef}
		onClose={() => (isAutobetOptionsOpen = false)}
		{stopPropagation}
	>
		{#snippet children()}
			<AutobetOptionsPanel
				{selectedAutobetRounds}
				onSelect={selectAutobetOption}
				onClose={() => (isAutobetOptionsOpen = false)}
			/>
		{/snippet}
	</OptionsOverlay>

	{#if isBonusModalOpen}
		<BonusBuyModal
			{pricedBonusOptions}
			{activeBonusName}
			{pendingBonus}
			{bonusPriceTextClassName}
			{userBalanceLabel}
			{selectedBet}
			{hasActiveBonus}
			{canDecreaseBet}
			{canIncreaseBet}
			bind:bonusBetPopoverRef
			{closeBonusModal}
			{openBonusConfirmation}
			{cancelBonusConfirmation}
			{cancelBonusConfirmationFromBackdrop}
			{confirmBonusAction}
			{decreaseBet}
			{increaseBet}
			{toggleBetOptions}
			{stopPropagation}
		/>
	{/if}
</div>
