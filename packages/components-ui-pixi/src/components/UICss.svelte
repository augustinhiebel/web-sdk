<script lang="ts">
	// @ts-nocheck
	import { onMount, tick } from 'svelte';
	import { stateBet, stateBetDerived, stateSound, stateUi } from 'state-shared';

	import { getContext } from '../context';
	import type { EmitterEventUi } from '../types';

	const BET_OPTIONS = [
		'$0.01',
		'$0.02',
		'$0.05',
		'$0.10',
		'$0.20',
		'$0.40',
		'$0.60',
		'$0.80',
		'$1.00',
		'$1.20',
		'$1.40',
		'$1.60',
		'$1.80',
		'$2.00',
		'$3.00',
		'$4.00',
		'$5.00',
		'$6.00',
		'$7.00',
		'$8.00',
		'$9.00',
		'$10.00',
		'$12.00',
		'$14.00',
		'$16.00',
		'$18.00',
		'$20.00',
		'$30.00',
		'$40.00',
		'$50.00',
		'$75.00',
		'$100.00',
		'$150.00',
		'$200.00',
		'$250.00',
		'$300.00',
		'$350.00',
		'$400.00',
		'$450.00',
		'$500.00',
		'$750.00',
		'$1,000.00',
	];

	const AUTOBET_OPTIONS = ['∞', '10', '25', '50', '100', '200', '300', '500', '1000'];
	const FALLBACK_USER_BALANCE = 100;
	const POPOVER_MARGIN = 12;
	const POPOVER_GAP = 16;
	const closeIconPath =
		'M14.828,12l2.828-2.828c.391-.391,.391-1.024,0-1.414l-1.414-1.414c-.391-.391-1.024-.391-1.414,0l-2.828,2.828-2.828-2.828c-.391-.391-1.024-.391-1.414,0l-1.414,1.414c-.391,.391-.391,1.024,0,1.414l2.828,2.828-2.828,2.828c-.391,.391-.391,1.024,0,1.414l1.414,1.414c.391,.391,1.024,.391,1.414,0l2.828-2.828,2.828,2.828c.391,.391,1.024,.391,1.414,0l1.414-1.414c.391-.391,.391-1.024,0-1.414l-2.828-2.828Z';

	const BONUS_OPTIONS = [
		{
			name: 'Ante',
			description: '5x chance to enter bonus games',
			multiplier: 3,
			actionType: 'activate',
			betModeKey: 'ANTE',
		},
		{
			name: 'Max or Zero',
			description: 'Win big with 25,000x or go home',
			multiplier: 5,
			actionType: 'activate',
			betModeKey: 'SUPERANTE',
		},
		{
			name: 'Bonus',
			description: 'Bonus round with sticky wins',
			multiplier: 10,
			actionType: 'buy',
			betModeKey: 'BONUS',
		},
		{
			name: 'Super',
			description: 'Super bonus with boosted features',
			multiplier: 100,
			actionType: 'buy',
			betModeKey: 'SUPER',
		},
		{
			name: 'Mystery',
			description: 'Roll a random bonus',
			multiplier: 500,
			actionType: 'buy',
			betModeKey: 'BONUS',
		},
		{
			name: 'Epic',
			description: 'Unlock the top bonus selection',
			multiplier: 1000,
			actionType: 'buy',
			betModeKey: 'SUPER',
		},
	];

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
	const parseCurrencyValue = (value) => Number(String(value).replace(/[$,]/g, ''));
	const formatCurrencyValue = (value) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency ?? stateBet.currency ?? 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);
	const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

	let musicVolume = $state(stateSound.volumeValueMusic);
	let soundVolume = $state(stateSound.volumeValueSoundEffect);
	let previousMusicVolume = $state(stateSound.volumeValueMusic || 50);
	let previousSoundVolume = $state(stateSound.volumeValueSoundEffect || 50);
	let selectedBet = $state(bet ?? formatCurrencyValue(stateBet.betAmount || 1));
	let isSettingsOpen = $state(menuOpen ?? false);
	let isBetOptionsOpen = $state(betOptionsOpen);
	let isAutobetOptionsOpen = $state(autobetOptionsOpen);
	let selectedAutobetRounds = $state(autoSpinCount ?? (autoSpinActive ? stateUi.autoSpinsText : null));
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
	const userBalanceLabel = $derived(balance ?? formatCurrencyValue(userBalanceValue).replace('.00', ''));
	const winLabel = $derived(win ?? formatCurrencyValue(stateBet.winBookEventAmount || 143));
	const canDecreaseBet = $derived(selectedBetIndex > 0);
	const canIncreaseBet = $derived(selectedBetIndex > -1 && selectedBetIndex < BET_OPTIONS.length - 1);
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
			const actionType = bonus.actionType === 'buy' && isBonusPurchased ? 'activate' : bonus.actionType;

			return {
				...bonus,
				actionType,
				priceValue,
				priceLabel: formatCurrencyValue(priceValue),
				isUnaffordable: priceValue > userBalanceValue && !isBonusActive && actionType !== 'activate',
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
		betLayout.mode === 'modal' || betLayout.gridColumns === 'compact' ? 'bet-grid-compact' : 'bet-grid-wide',
	);

	function getGameBoundsSnapshot(gameElement) {
		if (!gameElement) return { width: 0, height: 0, left: 0, top: 0 };
		const gameRect = gameElement.getBoundingClientRect();
		return {
			width: gameRect.width,
			height: gameRect.height,
			left: gameRect.left,
			top: gameRect.top,
		};
	}

	function getLocalAnchorRect(anchorElement, bounds) {
		if (!anchorElement || !bounds.width || !bounds.height) return null;
		const anchorRect = anchorElement.getBoundingClientRect();

		return {
			width: anchorRect.width,
			height: anchorRect.height,
			left: anchorRect.left - bounds.left,
			right: anchorRect.right - bounds.left,
			top: anchorRect.top - bounds.top,
			bottom: anchorRect.bottom - bounds.top,
		};
	}

	function getAdaptivePopoverLayout({
		anchorRect,
		panelSize,
		boundsSize,
		preferredAlignment = 'right',
		preferredWidth,
		compactWidth,
		maxHeight,
		forceModalWhenConstrained = false,
	}) {
		const boundsWidth = boundsSize.width || 0;
		const boundsHeight = boundsSize.height || 0;
		const availableWidth = Math.max(0, boundsWidth - POPOVER_MARGIN * 2);
		const availableHeight = Math.max(0, boundsHeight - POPOVER_MARGIN * 2);

		if (availableWidth <= 0 || availableHeight <= 0) {
			return {
				mode: 'anchored',
				left: POPOVER_MARGIN,
				top: POPOVER_MARGIN,
				width: Math.min(preferredWidth, Math.max(0, availableWidth)),
				maxHeight: Math.min(maxHeight, Math.max(0, availableHeight - POPOVER_MARGIN)),
				transformOrigin: 'bottom right',
				isPositionReady: false,
			};
		}

		const fitsPreferredWidth = preferredWidth <= availableWidth;
		if (!fitsPreferredWidth && forceModalWhenConstrained) {
			return {
				mode: 'modal',
				width: Math.min(preferredWidth, availableWidth),
				maxHeight: Math.min(maxHeight, Math.max(0, availableHeight - POPOVER_MARGIN)),
				isPositionReady: true,
			};
		}

		const width = fitsPreferredWidth ? preferredWidth : Math.min(compactWidth, availableWidth);
		const hasMeasuredPanelSize = panelSize && Math.abs(panelSize.width - width) < 2;
		const measuredPanelHeight = hasMeasuredPanelSize ? panelSize.height : null;
		const panelHeight = Math.min(measuredPanelHeight ?? maxHeight, availableHeight);
		const maxPanelHeight = Math.min(maxHeight, availableHeight);

		if (!anchorRect) {
			return {
				mode: 'anchored',
				left: POPOVER_MARGIN,
				top: POPOVER_MARGIN,
				width,
				maxHeight: maxPanelHeight,
				gridColumns: fitsPreferredWidth ? 'wide' : 'compact',
				transformOrigin: 'bottom right',
				isPositionReady: false,
			};
		}

		const anchorCenterX = anchorRect.left + anchorRect.width / 2;
		const unclampedLeft =
			preferredAlignment === 'center' ? anchorCenterX - width / 2 : anchorRect.right - width;
		const left = clamp(
			unclampedLeft,
			POPOVER_MARGIN,
			Math.max(POPOVER_MARGIN, boundsWidth - width - POPOVER_MARGIN),
		);
		const preferredTop = anchorRect.top - POPOVER_GAP - panelHeight;
		const canFitAbove = preferredTop >= POPOVER_MARGIN;
		const spaceAbove = anchorRect.top - POPOVER_MARGIN - POPOVER_GAP;
		const spaceBelow = boundsHeight - anchorRect.bottom - POPOVER_MARGIN - POPOVER_GAP;
		const shouldPlaceBelow = !canFitAbove && spaceBelow > spaceAbove;
		const unclampedTop = shouldPlaceBelow ? anchorRect.bottom + POPOVER_GAP : preferredTop;
		const top = clamp(
			unclampedTop,
			POPOVER_MARGIN,
			Math.max(POPOVER_MARGIN, boundsHeight - panelHeight - POPOVER_MARGIN),
		);

		return {
			mode: fitsPreferredWidth && canFitAbove && Math.abs(left - unclampedLeft) < 1 ? 'anchored' : 'repositioned',
			left,
			top,
			width,
			maxHeight: maxPanelHeight,
			gridColumns: fitsPreferredWidth ? 'wide' : 'compact',
			transformOrigin: shouldPlaceBelow ? 'top right' : 'bottom right',
			isPositionReady: Boolean(measuredPanelHeight),
		};
	}

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
			autobet: isAutobetOptionsOpen ? getPanelSize(autobetOptionsPopoverRef) : popoverPanelSizes.autobet,
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
		<div class="active-bonus-banner">
			<span>BONUS {activeBonus?.name} ACTIVATED</span>
		</div>
	{/if}

	<div id="controls" class="controls">
		<div class="mobile-controls">
			<div class="mobile-main-row">
				<button
					aria-label="Bonus buy"
					aria-expanded={isBonusModalOpen}
					type="button"
					onclick={() => {
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
					}}
					class="icon-button mobile-bonus-button"
					class:is-active={hasActiveBonus}
				>
					<span class="toggle-icon">
						<svg class="toggle-primary" class:toggle-hidden={hasActiveBonus} viewBox="0 0 24 24">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M16.3234 0.0866699L15.6452 9.04525H23.706L10.6766 23.9133L11.3548 14.9548H3.29402L16.3234 0.0866699Z" />
							<path fill-rule="evenodd" clip-rule="evenodd" d="M2 4H9V6H2V4Z" />
							<path fill-rule="evenodd" clip-rule="evenodd" d="M3 18H9V20H3V18Z" />
							<path fill-rule="evenodd" clip-rule="evenodd" d="M0 8H4V10H0V8Z" />
						</svg>
						<svg class="toggle-active" class:toggle-visible={hasActiveBonus} viewBox="0 0 24 24">
							<path d={closeIconPath} fill="currentColor" />
						</svg>
					</span>
				</button>

				{#if showExtras}
					<div class="mobile-extras-card">
						<div>
							<span>Total win</span>
							<strong>{winLabel}</strong>
						</div>
						<div>
							<span>Free spins</span>
							<strong>{stateUi.freeSpinCounterCurrent || 1}/{stateUi.freeSpinCounterTotal || 4}</strong>
						</div>
					</div>
				{:else}
					<button
						aria-label="Decrease bet amount"
						type="button"
						onclick={decreaseBet}
						disabled={!canDecreaseBet}
						class="stepper-button mobile-stepper-left"
					>
						<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="4" rx="1" ry="1" /></svg>
					</button>

					<div class="mobile-spin-wrap">
						<button
							aria-label={selectedAutobetRounds ? 'Stop auto bet' : isIdle ? 'Bet / spin' : 'Stop'}
							type="button"
							onclick={handleSpinClick}
							disabled={spinIsDisabled && !selectedAutobetRounds}
							class="spin-button"
						>
							{#if selectedAutobetRounds}
								<span class="autobet-count">
									<span class:autobet-count-small={selectedAutobetRounds > 99} class:autobet-count-infinity={selectedAutobetRounds === '∞'}>
										{selectedAutobetRounds}
									</span>
								</span>
							{:else}
								<svg class="spin-icon" viewBox="0 0 24 24">
									<path d="M23.216,9.216l-1.549-9.297l-3.198,3.198C16.599,1.75,14.356,1,12,1C5.935,1,1,5.935,1,12s4.935,11,11,11 c4.374,0,8.332-2.59,10.084-6.599c0.221-0.506-0.01-1.096-0.516-1.317c-0.505-0.219-1.095,0.01-1.317,0.516 C18.818,18.88,15.579,21,12,21c-4.962,0-9-4.038-9-9s4.038-9,9-9c1.821,0,3.562,0.544,5.039,1.547l-3.12,3.12L23.216,9.216z" />
								</svg>
							{/if}
						</button>
					</div>

					<button
						aria-label="Increase bet amount"
						type="button"
						onclick={increaseBet}
						disabled={!canIncreaseBet}
						class="stepper-button mobile-stepper-right"
					>
						<svg viewBox="0 0 24 24">
							<path d="M18,10h-4V6c0-.552-.448-1-1-1h-2c-.552,0-1,.448-1,1v4H6c-.552,0-1,.448-1,1v2c0,.552,.448,1,1,1h4v4c0,.552,.448,1,1,1h2c.552,0,1-.448,1-1v-4h4c.552,0,1-.448,1-1v-2c0-.552-.448-1-1-1Z" />
						</svg>
					</button>
				{/if}

				<div class="mobile-icon-grid">
					<div role="presentation" bind:this={mobileAutobetPopoverRef} onmousedown={stopPropagation} ontouchstart={stopPropagation}>
						<button
							aria-label="Auto bet settings"
							aria-expanded={isAutobetOptionsOpen}
							type="button"
							onclick={(event) => handleAutobetToggle('mobile', event)}
							class="mini-button"
						>
							<span class="toggle-icon">
								<svg class="toggle-primary" class:toggle-hidden={isAutobetOptionsOpen} viewBox="0 0 24 24">
									<path d="M23,20V4a3,3,0,0,0-3-3H4A3,3,0,0,0,1,4V20a3,3,0,0,0,3,3H20A3,3,0,0,0,23,20ZM10.269,15.943A.5.5,0,0,1,10,15.5v-7a.5.5,0,0,1,.787-.409l5,3.5a.518.518,0,0,1,0,.818l-5,3.5A.5.5,0,0,1,10.269,15.943Z" />
								</svg>
								<svg class="toggle-active" class:toggle-visible={isAutobetOptionsOpen} viewBox="0 0 24 24">
									<path d={closeIconPath} fill="currentColor" />
								</svg>
							</span>
						</button>
					</div>

					<div class="mobile-settings-cell" bind:this={mobileSettingsPopoverRef}>
						<button
							aria-label="Settings"
							aria-expanded={isSettingsOpen}
							type="button"
							onclick={handleSettingsToggle}
							class="settings-button-vertical"
						>
							<span class="toggle-icon">
								<svg class="toggle-primary" class:toggle-hidden={isSettingsOpen} viewBox="0 0 24 24">
									<circle cx="4" cy="4" r="3" /><circle cx="4" cy="12" r="3" /><circle cx="4" cy="20" r="3" /><path d="M22,2H10C9.4,2,9,2.4,9,3v2c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1V3C23,2.4,22.6,2,22,2z" /><path d="M22,10H10c-0.6,0-1,0.4-1,1v2c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1v-2C23,10.4,22.6,10,22,10z" /><path d="M22,18H10c-0.6,0-1,0.4-1,1v2c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1v-2C23,18.4,22.6,18,22,18z" />
								</svg>
								<svg class="toggle-active" class:toggle-visible={isSettingsOpen} viewBox="0 0 24 24">
									<path d={closeIconPath} fill="currentColor" />
								</svg>
							</span>
						</button>
						<div role="presentation" onclick={stopPropagation} onmousedown={stopPropagation} class="settings-popover mobile-settings-popover" class:is-open={isSettingsOpen}>
							{@render SettingsMenu()}
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
						<svg viewBox="0 0 24 24"><path d="M7.35846 1L4.21744 15H9.85269L9.25347 23.8042L21.5906 8.5H14.1938L15.74 1H7.35846Z" /></svg>
					</button>
				</div>
			</div>

			<div class="mobile-footer-row">
				<button type="button" class="label-button" onclick={() => (showExtras = !showExtras)}>
					<span>Balance</span>
					<strong>{userBalanceLabel}</strong>
				</button>
				{#if showWin && !showExtras}
					<div class="label-group label-group-win">
						<span>Total win</span>
						<strong>{winLabel}</strong>
					</div>
				{/if}
				<div role="presentation" class="mobile-bet-anchor" bind:this={mobileFooterBetPopoverRef} onmousedown={stopPropagation} ontouchstart={stopPropagation}>
					<button
						aria-label="Bet amount"
						aria-expanded={isBetOptionsOpen}
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

		<div class="desktop-controls">
			{#if hasActiveBonus}
				<div class="desktop-active-bonus">
					<span>BONUS {activeBonus?.name} ACTIVATED</span>
				</div>
			{/if}

			<div class="desktop-settings-wrap" bind:this={desktopSettingsPopoverRef}>
				<button
					aria-label="Settings"
					aria-expanded={isSettingsOpen}
					type="button"
					onclick={handleSettingsToggle}
					class="glass-button settings-square"
				>
					<span class="toggle-icon">
						<svg class="toggle-primary" class:toggle-hidden={isSettingsOpen} viewBox="0 0 24 24">
							<circle cx="4" cy="4" r="3" /><circle cx="4" cy="12" r="3" /><circle cx="4" cy="20" r="3" /><path d="M22,2H10C9.4,2,9,2.4,9,3v2c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1V3C23,2.4,22.6,2,22,2z" /><path d="M22,10H10c-0.6,0-1,0.4-1,1v2c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1v-2C23,10.4,22.6,10,22,10z" /><path d="M22,18H10c-0.6,0-1,0.4-1,1v2c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1v-2C23,18.4,22.6,18,22,18z" />
						</svg>
						<svg class="toggle-active" class:toggle-visible={isSettingsOpen} viewBox="0 0 24 24">
							<path d={closeIconPath} fill="currentColor" />
						</svg>
					</span>
				</button>
				<div role="presentation" onclick={stopPropagation} onmousedown={stopPropagation} class="settings-popover desktop-settings-popover" class:is-open={isSettingsOpen}>
					{@render SettingsMenu()}
				</div>
			</div>

			<button
				aria-label="Bonus buy"
				aria-expanded={isBonusModalOpen}
				type="button"
				onclick={() => {
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
				}}
				class="glass-button bonus-square"
				class:is-active={hasActiveBonus}
			>
				<span class="toggle-icon">
					<svg class="toggle-primary" class:toggle-hidden={hasActiveBonus} viewBox="0 0 24 24">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M16.3234 0.0866699L15.6452 9.04525H23.706L10.6766 23.9133L11.3548 14.9548H3.29402L16.3234 0.0866699Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M2 4H9V6H2V4Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M3 18H9V20H3V18Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M0 8H4V10H0V8Z" />
					</svg>
					<svg class="toggle-active" class:toggle-visible={hasActiveBonus} viewBox="0 0 24 24">
						<path d={closeIconPath} fill="currentColor" />
					</svg>
				</span>
			</button>

			<div class="desktop-info-bar">
				<i class="spin-cutout"></i>
				<div class="info-content">
					<button type="button" class="label-button" onclick={() => (showExtras = !showExtras)}>
						<span>Balance</span>
						<strong>{userBalanceLabel}</strong>
					</button>
					{#if showWin}
						<div class="label-group label-group-win">
							<span>Total win</span>
							<strong>{winLabel}</strong>
						</div>
					{/if}
					{#if showExtras}
						<div class="label-group">
							<span>Free spins</span>
							<strong>{stateUi.freeSpinCounterCurrent || 1}/{stateUi.freeSpinCounterTotal || 4}</strong>
						</div>
					{/if}
					<div role="presentation" class="desktop-bet-anchor" bind:this={desktopFooterBetPopoverRef} onmousedown={stopPropagation} ontouchstart={stopPropagation}>
						<button
							aria-label="Bet amount"
							aria-expanded={isBetOptionsOpen}
							type="button"
							onclick={() => toggleBetOptions('desktopFooter')}
							class="bet-label-button"
						>
							<span>Bet</span>
							<strong class:accent-text={hasActiveBonus}>{selectedBet}</strong>
						</button>
						<div class="desktop-bet-steppers">
							<button aria-label="Increase bet amount" type="button" onclick={increaseBet} disabled={!canIncreaseBet}>
								<svg viewBox="0 0 24 24"><path d="M16.707,13.293l-4-4a1,1,0,0,0-1.414,0l-4,4a1,1,0,1,0,1.414,1.414L12,11.414l3.293,3.293a1,1,0,0,0,1.414-1.414Z" /></svg>
							</button>
							<button aria-label="Decrease bet amount" type="button" onclick={decreaseBet} disabled={!canDecreaseBet}>
								<svg viewBox="0 0 24 24"><path d="M12,15a1,1,0,0,1-.707-.293l-4-4A1,1,0,1,1,8.707,9.293L12,12.586l3.293-3.293a1,1,0,0,1,1.414,1.414l-4,4A1,1,0,0,1,12,15Z" /></svg>
							</button>
						</div>
					</div>
				</div>

				<div class="desktop-spin-slot">
					<button
						aria-label={selectedAutobetRounds ? 'Stop auto bet' : isIdle ? 'Bet / spin' : 'Stop'}
						type="button"
						onclick={handleSpinClick}
						disabled={spinIsDisabled && !selectedAutobetRounds}
						class="spin-button desktop-spin-button"
					>
						{#if selectedAutobetRounds}
							<span class="autobet-count">
								<span class:autobet-count-small={selectedAutobetRounds > 99} class:autobet-count-infinity={selectedAutobetRounds === '∞'}>{selectedAutobetRounds}</span>
							</span>
						{:else}
							<svg class="spin-icon" viewBox="0 0 24 24"><path d="M23.216,9.216l-1.549-9.297l-3.198,3.198C16.599,1.75,14.356,1,12,1C5.935,1,1,5.935,1,12s4.935,11,11,11 c4.374,0,8.332-2.59,10.084-6.599c0.221-0.506-0.01-1.096-0.516-1.317c-0.505-0.219-1.095,0.01-1.317,0.516 C18.818,18.88,15.579,21,12,21c-4.962,0-9-4.038-9-9s4.038-9,9-9c1.821,0,3.562,0.544,5.039,1.547l-3.12,3.12L23.216,9.216z" /></svg>
						{/if}
					</button>
				</div>
			</div>

			<div class="desktop-side-actions">
				<div role="presentation" bind:this={desktopAutobetPopoverRef} onmousedown={stopPropagation} ontouchstart={stopPropagation}>
					<button
						aria-label="Auto bet settings"
						aria-expanded={isAutobetOptionsOpen}
						type="button"
						onclick={(event) => handleAutobetToggle('desktop', event)}
						class="mini-button desktop-mini-button"
					>
						<span class="toggle-icon">
							<svg class="toggle-primary" class:toggle-hidden={isAutobetOptionsOpen} viewBox="0 0 24 24">
								<path d="M23,20V4a3,3,0,0,0-3-3H4A3,3,0,0,0,1,4V20a3,3,0,0,0,3,3H20A3,3,0,0,0,23,20ZM10.269,15.943A.5.5,0,0,1,10,15.5v-7a.5.5,0,0,1,.787-.409l5,3.5a.518.518,0,0,1,0,.818l-5,3.5A.5.5,0,0,1,10.269,15.943Z" />
							</svg>
							<svg class="toggle-active" class:toggle-visible={isAutobetOptionsOpen} viewBox="0 0 24 24">
								<path d={closeIconPath} fill="currentColor" />
							</svg>
						</span>
					</button>
				</div>
				<button
					aria-label="Fast mode"
					aria-pressed={isFastModeActive}
					type="button"
					onclick={handleFastModeToggle}
					class="mini-button desktop-mini-button"
					class:is-active={isFastModeActive}
				>
					<svg viewBox="0 0 24 24"><path d="M7.35846 1L4.21744 15H9.85269L9.25347 23.8042L21.5906 8.5H14.1938L15.74 1H7.35846Z" /></svg>
				</button>
			</div>
		</div>
	</div>

	{#if betLayout.mode === 'modal'}
		<div role="presentation" class="option-modal" class:is-open={isBetOptionsOpen} onclick={() => (isBetOptionsOpen = false)}>
			<div role="presentation" bind:this={betOptionsPopoverRef} onclick={stopPropagation} style={`width: ${betLayout.width}px; max-height: ${betLayout.maxHeight}px;`} class="options-panel">
				{@render BetOptions()}
			</div>
		</div>
	{:else}
		<div role="presentation" class="option-modal mobile-only-modal" class:is-open={isBetOptionsOpen} onclick={() => (isBetOptionsOpen = false)}>
			<div role="presentation" onclick={stopPropagation} class="options-panel">
				{@render BetOptions()}
			</div>
		</div>
		<div
			bind:this={betOptionsPopoverRef}
			style={`left: ${betLayout.left}px; top: ${betLayout.top}px; width: ${betLayout.width}px; max-height: ${betLayout.maxHeight}px; transform-origin: ${betLayout.transformOrigin}; visibility: ${isBetOptionsOpen && !betLayout.isPositionReady ? 'hidden' : 'visible'};`}
			class="options-panel anchored-options-panel"
			class:is-open={isBetOptionsOpen && betLayout.isPositionReady}
			class:is-measuring={isBetOptionsOpen && !betLayout.isPositionReady}
		>
			{@render BetOptions()}
		</div>
	{/if}

	{#if autobetLayout.mode === 'modal'}
		<div role="presentation" class="option-modal" class:is-open={isAutobetOptionsOpen} onclick={() => (isAutobetOptionsOpen = false)}>
			<div role="presentation" bind:this={autobetOptionsPopoverRef} onclick={stopPropagation} style={`width: ${autobetLayout.width}px; max-height: ${autobetLayout.maxHeight}px;`} class="options-panel">
				{@render AutobetOptions()}
			</div>
		</div>
	{:else}
		<div role="presentation" class="option-modal mobile-only-modal" class:is-open={isAutobetOptionsOpen} onclick={() => (isAutobetOptionsOpen = false)}>
			<div role="presentation" onclick={stopPropagation} class="options-panel">
				{@render AutobetOptions()}
			</div>
		</div>
		<div
			bind:this={autobetOptionsPopoverRef}
			style={`left: ${autobetLayout.left}px; top: ${autobetLayout.top}px; width: ${autobetLayout.width}px; max-height: ${autobetLayout.maxHeight}px; transform-origin: ${autobetLayout.transformOrigin}; visibility: ${isAutobetOptionsOpen && !autobetLayout.isPositionReady ? 'hidden' : 'visible'};`}
			class="options-panel anchored-options-panel"
			class:is-open={isAutobetOptionsOpen && autobetLayout.isPositionReady}
			class:is-measuring={isAutobetOptionsOpen && !autobetLayout.isPositionReady}
		>
			{@render AutobetOptions()}
		</div>
	{/if}

	{#if isBonusModalOpen}
		<div class="bonus-overlay">
			<button aria-label="Close bonus selection" type="button" onclick={closeBonusModal} class="bonus-close-button">
				<svg viewBox="0 0 24 24"><path d={closeIconPath} fill="currentColor" /></svg>
			</button>

			<div class="bonus-scroller">
				<div role="presentation" class="bonus-card-row" onclick={stopPropagation}>
					{#each pricedBonusOptions as bonus, itemIndex}
						{@const isBonusActive = activeBonusName === bonus.name}
						{@const isActionDisabled = bonus.isUnaffordable}
						<article style={`animation-delay: ${itemIndex * 0.05}s`} class="bonus-card" class:is-disabled={bonus.isUnaffordable}>
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
				<div role="presentation" id="bonus-modal-bet-controls" bind:this={bonusBetPopoverRef} onmousedown={stopPropagation} ontouchstart={stopPropagation} class="bonus-bet-controls">
					<button aria-label="Decrease bonus bet amount" type="button" onclick={decreaseBet} disabled={!canDecreaseBet}>
						<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="4" rx="1" ry="1" /></svg>
					</button>
					<button aria-label="Bet amount" aria-expanded={isBetOptionsOpen} type="button" onclick={() => toggleBetOptions('bonusModal')} class="bonus-bet-label">
						<span>Bet</span>
						<strong class:accent-text={hasActiveBonus}>{selectedBet}</strong>
					</button>
					<button aria-label="Increase bonus bet amount" type="button" onclick={increaseBet} disabled={!canIncreaseBet}>
						<svg viewBox="0 0 24 24"><path d="M18,10h-4V6c0-.552-.448-1-1-1h-2c-.552,0-1,.448-1,1v4H6c-.552,0-1,.448-1,1v2c0,.552,.448,1,1,1h4v4c0,.552,.448,1,1,1h2c.552,0,1-.448,1-1v-4h4c.552,0,1-.448,1-1v-2c0-.552-.448-1-1-1Z" /></svg>
					</button>
				</div>
			</div>

			{#if pendingBonus}
				<div role="presentation" class="bonus-confirm-backdrop" onclick={cancelBonusConfirmationFromBackdrop}>
					<div role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="bonus-confirmation-title" class="bonus-confirm-dialog">
						<div class="bonus-confirm-media"></div>
						<div class="bonus-confirm-body">
							<h3 id="bonus-confirmation-title">{pendingBonus.name}</h3>
							<p>
								{pendingBonus.actionType === 'activate' ? pendingBonus.description : `${pendingBonus.priceLabel} will be subtracted from your balance`}
							</p>
							<div>
								<button type="button" onclick={cancelBonusConfirmation} class="confirm-cancel-button">Cancel</button>
								<button type="button" onclick={confirmBonusAction} class="confirm-action-button" class:activate={pendingBonus.actionType === 'activate'}>
									<span>{pendingBonus.actionType === 'activate' ? (activeBonusName === pendingBonus.name ? 'Deactivate' : 'Activate') : 'Buy'}</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#snippet SettingsMenu()}
	<ul class="settings-menu">
		<li>
			<button type="button" class="settings-menu-info">
				<svg viewBox="0 0 24 24">
					<path d="m16.556,1H7.444L1,7.444v9.111l6.444,6.444h9.111l6.444-6.444V7.444l-6.444-6.444Zm-3.556,17h-2v-6h-2v-2h2.5c.827,0,1.5.673,1.5,1.5v6.5Zm-1-9.5c-.689,0-1.25-.561-1.25-1.25s.561-1.25,1.25-1.25,1.25.561,1.25,1.25-.561,1.25-1.25,1.25Z" />
				</svg>
				<span>Game info</span>
			</button>
		</li>
		<li class="settings-range-row">
			<button aria-label="Toggle music volume" aria-pressed={musicVolume === 0} type="button" onclick={toggleMusicVolume}>
				<svg viewBox="0 0 24 24">
					{#if musicVolume === 0}
						<path d="M23.9196 0.61C23.8696 0.49 23.7996 0.38 23.7096 0.29C23.5096 0.09 23.2396 0 22.9796 0H7.99957C7.44957 0 6.99957 0.45 6.99957 1V15.58L6.88957 15.69C6.19957 15.25 5.37957 14.99 4.49957 14.99C2.01957 14.99 -0.00042969 17.01 -0.00042969 19.49C-0.00042969 20.37 0.25957 21.18 0.69957 21.87L0.28957 22.28C-0.10043 22.67 -0.10043 23.3 0.28957 23.69C0.48957 23.89 0.73957 23.98 0.99957 23.98C1.25957 23.98 1.50957 23.88 1.70957 23.69L2.10957 23.29L8.99957 16.4L17.4096 7.99L23.7096 1.69L23.9996 1.4V0.99C23.9996 0.86 23.9696 0.73 23.9196 0.6V0.61ZM8.99957 13.58V8H14.5796L8.99957 13.58ZM8.99957 19.24V19.5C8.99957 21.98 6.97957 24 4.49957 24C4.41957 24 4.33957 23.98 4.25957 23.98L8.99957 19.24ZM23.9996 4.24V17.5C23.9996 19.98 21.9796 22 19.4996 22C17.0196 22 14.9996 19.98 14.9996 17.5C14.9996 15.02 17.0196 13 19.4996 13C20.4196 13 21.2796 13.28 21.9996 13.76V8H20.2396L23.9996 4.24Z" />
					{:else}
						<path d="M23,0H8C7.448,0,7,0.448,7,1v14.762C6.284,15.282,5.425,15,4.5,15C2.019,15,0,17.019,0,19.5S2.019,24,4.5,24 S9,21.981,9,19.5V8h13v5.762C21.284,13.282,20.425,13,19.5,13c-2.481,0-4.5,2.019-4.5,4.5s2.019,4.5,4.5,4.5s4.5-2.019,4.5-4.5V1 C24,0.448,23.552,0,23,0z" />
					{/if}
				</svg>
			</button>
			<input aria-label="Music volume" type="range" min="0" max="100" value={musicVolume} oninput={updateMusicVolume} onchange={updateMusicVolume} style={`--range-value: ${musicVolume}%;`} />
		</li>
		<li class="settings-range-row">
			<button aria-label="Toggle sound volume" aria-pressed={soundVolume === 0} type="button" onclick={toggleSoundVolume}>
				<svg viewBox="0 0 24 24">
					{#if soundVolume === 0}
						<path d="M10.567,17.675L17.4,22.8c0.176,0.133,0.388,0.2,0.6,0.2c0.152,0,0.306-0.035,0.447-0.105 C18.786,22.725,19,22.379,19,22V9.242L10.567,17.675z" /><path d="M2,17h5L19,5V2c0-0.379-0.214-0.725-0.553-0.895C18.109,0.938,17.703,0.973,17.4,1.2L9.667,7H2 C1.447,7,1,7.447,1,8v8C1,16.553,1.447,17,2,17z" /><path d="M1,24c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l22-22 c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414l-22,22C1.512,23.902,1.256,24,1,24z" />
					{:else}
						<path d="M14.447,1.105C14.109,0.938,13.703,0.973,13.4,1.2L5.667,7H1C0.447,7,0,7.447,0,8v8c0,0.553,0.447,1,1,1 h4.667l7.733,5.8c0.176,0.133,0.388,0.2,0.6,0.2c0.152,0,0.306-0.035,0.447-0.105C14.786,22.725,15,22.379,15,22V2 C15,1.621,14.786,1.275,14.447,1.105z" /><rect x="18" y="11" width="6" height="2" /><rect x="16.392" y="5" width="6" height="2" transform="matrix(0.8661 -0.4999 0.4999 0.8661 -0.4024 10.4981)" /><rect x="18.392" y="15" width="2" height="6" transform="matrix(0.5 -0.866 0.866 0.5 -5.8923 25.7943)" />
					{/if}
				</svg>
			</button>
			<input aria-label="Sound volume" type="range" min="0" max="100" value={soundVolume} oninput={updateSoundVolume} onchange={updateSoundVolume} style={`--range-value: ${soundVolume}%;`} />
		</li>
	</ul>
{/snippet}

{#snippet BetOptions()}
	<h3 class="options-title">Bet amount</h3>
	<button aria-label="Close bet options" type="button" onclick={() => (isBetOptionsOpen = false)} class="options-close-button">
		<svg viewBox="0 0 24 24"><path d={closeIconPath} fill="currentColor" /></svg>
	</button>
	<ul class={`bet-options-grid ${betGridClassName}`}>
		{#each BET_OPTIONS as item}
			<li>
				<button type="button" onclick={() => selectBetOption(item)} class="option-choice" class:is-selected={selectedBet === item}>
					<span>{item}</span>
				</button>
			</li>
		{/each}
	</ul>
{/snippet}

{#snippet AutobetOptions()}
	<h3 class="options-title">Autoplay rounds</h3>
	<button aria-label="Close autoplay options" type="button" onclick={() => (isAutobetOptionsOpen = false)} class="options-close-button">
		<svg viewBox="0 0 24 24"><path d={closeIconPath} fill="currentColor" /></svg>
	</button>
	<ul class="autobet-options-grid">
		{#each AUTOBET_OPTIONS as item}
			<li>
				<button type="button" onclick={() => selectAutobetOption(item)} class="autobet-choice" class:is-selected={selectedAutobetRounds === item}>
					<span>{item}</span>
				</button>
			</li>
		{/each}
	</ul>
{/snippet}

<style>

	:root {
		font-size: 16px;
	}
	.ui-root {
		--ui-accent: #fa0000;
		--ui-black: rgba(0, 0, 0, 0.7);
		--ui-black-strong: rgba(0, 0, 0, 0.95);
		--ui-white-soft: rgba(255, 255, 255, 0.7);
		--ui-border: rgba(0, 0, 0, 0.7);
		--ui-shadow-glass: inset 0 0 0 1px rgba(255, 255, 255, 0.2),
			inset 0 1px 0 0 rgba(255, 255, 255, 0.55),
			inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
			inset 0 -2px 0 2px rgba(0, 0, 0, 0.25);
		--ui-shadow-panel: inset 0 0 0 1px rgba(255, 255, 255, 0.075),
			inset 0 1px 1px 0 rgba(255, 255, 255, 0.125);
		--ui-ease: cubic-bezier(0.22, 1, 0.36, 1);

		position: absolute;
		inset: 0;
		z-index: 10;
		container: universal-ui / inline-size;
		overflow: hidden;
		color: var(--ui-accent);
		font-family: Rubik, system-ui, sans-serif;
		pointer-events: none;

		*,
		*::before,
		*::after {
			box-sizing: border-box;
		}
	}

	button {
		appearance: none;
		border: 0;
		padding: 0;
		font: inherit;
		color: inherit;
		background: transparent;
		cursor: pointer;

		&:disabled {
			cursor: not-allowed;
		}
	}

	svg {
		display: block;
		width: 100%;
		height: 100%;
		fill: currentColor;
		pointer-events: none;
	}

	.controls {
		position: absolute;
		inset-inline: 0;
		bottom: 0;
		z-index: 10;
		width: min(770px, 100%);
		margin-inline: auto;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		pointer-events: auto;
		perspective: 1000px;
	}

	.desktop-controls {
		display: none;
	}

	.mobile-controls {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.mobile-main-row {
		position: relative;
		z-index: 10;
		height: 6rem;
		margin-bottom: -0.5rem;
		display: flex;
		align-items: center;
		justify-content: space-around;
		gap: 0.5rem;
		padding-inline: 0.75rem;
	}

	.mobile-footer-row {
		position: relative;
		z-index: 0;
		min-height: 2.75rem;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.75rem;
		border-radius: 0.5rem;
		background: linear-gradient(to bottom, transparent, var(--ui-black), var(--ui-black));
	}

	.glass-button,
	.icon-button,
	.stepper-button,
	.spin-button,
	.mini-button,
	.settings-button-vertical {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--ui-border);
		background: var(--ui-black);
		color: #ffffff;
		box-shadow: var(--ui-shadow-glass);
		transition:
			transform 200ms var(--ui-ease),
			filter 200ms var(--ui-ease),
			background 200ms var(--ui-ease),
			opacity 200ms var(--ui-ease);
		outline: 2px solid transparent;
		outline-offset: 2px;

		&:focus-visible {
			outline-color: #ffffff;
		}

		&:active {
			transform: scale(0.95);
			filter: brightness(1.5);
			transition-duration: 0ms;
		}
	}

	.icon-button {
		width: 4.25rem;
		height: 4.25rem;
		border-radius: 0.5rem;
		flex-shrink: 0;

		&.is-active {
			background: var(--ui-accent);
			color: #ffffff;
		}
	}

	.glass-button {
		&.is-active {
			background: var(--ui-accent);
			color: #ffffff;
		}
	}

	.stepper-button {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 999px;

		svg {
			width: 2rem;
			height: 2rem;
			color: #ffffff;
		}

		&:disabled {
			background: rgba(0, 0, 0, 0.3);
			opacity: 0.4;
		}
	}

	.mobile-stepper-left {
		margin-left: auto;
	}

	.mobile-stepper-right {
		margin-right: auto;
	}

	.mobile-spin-wrap {
		position: relative;
		width: 6rem;
		height: 6rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.spin-button {
		position: absolute;
		width: 6rem;
		height: 6rem;
		border-radius: 999px;

		&:disabled {
			opacity: 0.45;
		}

		&:active {
			.spin-icon {
				transform: scale(0.9);
			}
		}
	}

	.autobet-count {
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0.25rem solid currentColor;
		border-radius: 0.125rem;
		background: rgba(0, 0, 0, 0.2);
		color: #ffffff;
		font-weight: 700;
		line-height: 1;
		filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.35));
	}

	.autobet-count-small {
		font-size: 0.875rem;
	}

	.autobet-count-infinity {
		font-size: 2.25rem;
	}

	.mobile-icon-grid {
		width: 4.25rem;
		height: 4.25rem;
		flex-shrink: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: 0.25rem;
	}

	.mini-button {
		width: 2rem;
		height: 2rem;
		border-radius: .3125rem;

		> svg {
			width: 66.666%;
		}

		&.is-active {
			background: #ffffff;
			color: #000000;
		}
	}

	.mobile-settings-cell {
		position: relative;
		grid-row: span 2;
	}

	.settings-button-vertical {
		width: 2rem;
		height: 4.25rem;
		border-radius: .3125rem;
	}

	.toggle-icon {
		position: relative;
		width: 66.666%;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
	}

	.toggle-primary,
	.toggle-active {
		position: absolute;
		inset: 0;
		color: currentColor;
		transition: all 200ms var(--ui-ease);
		pointer-events: none;
	}

	.toggle-active {
		opacity: 0;
		transform: rotate(-45deg);
	}

	.spin-icon {
		width: 60%;
		height: 60%;
		color: #ffffff;
		filter: drop-shadow(0 -2px 0 rgba(0, 0, 0, 0.25));
		transition: transform 200ms var(--ui-ease);
	}

	.toggle-hidden {
		opacity: 0;
		transform: rotate(-45deg);
	}

	.toggle-visible {
		opacity: 1;
		transform: rotate(0deg);
	}

	.mobile-extras-card {
		height: 4.25rem;
		width: 100%;
		display: flex;
		border-radius: 0.5rem;
		background: var(--ui-black);
		color: #ffffff;
		padding-block: 0.5rem;

		> div {
			min-width: 0;
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			line-height: 1;

			+ div {
				border-left: 1px solid rgba(255, 255, 255, 0.2);
			}
		}
	}

	.mobile-extras-card span,
	.label-button span,
	.label-group span,
	.bet-label-button span,
	.bonus-balance span,
	.bonus-bet-label span {
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1;
		text-transform: uppercase;
		color: var(--ui-white-soft);
	}

	.mobile-extras-card strong,
	.label-button strong,
	.label-group strong,
	.bet-label-button strong,
	.bonus-balance strong,
	.bonus-bet-label strong {
		font-size: 0.875rem;
		font-weight: 700;
		line-height: 1.15;
		color: #ffffff;
	}

	.label-button {
		min-width: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		line-height: 1;
		text-align: left;
	}

	.label-group {
		min-width: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1;
	}

	.label-group-win strong,
	.accent-text {
		color: var(--ui-accent) !important;
	}

	.mobile-bet-anchor {
		margin-left: auto;
		flex: 1;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.bet-label-button {
		min-width: 3.75rem;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0;
		border-radius: .3125rem;
		padding: 0.125rem 0.25rem;
		line-height: 1;
		text-align: right;

		&:hover {
			background: rgba(255, 255, 255, 0.25);

			> strong {
				text-decoration: underline;
			}
		}
	}

	.settings-popover {
		position: absolute;
		z-index: 30;
		overflow: hidden;
		border: 2px solid var(--ui-border);
		border-radius: 1rem;
		background: rgba(0, 0, 0, 0.9);
		box-shadow: var(--ui-shadow-panel);
		backdrop-filter: blur(8px);
		opacity: 0;
		pointer-events: none;
		transform: translateY(-0.25rem) scale(0.95);
		transition: all 100ms cubic-bezier(0.16, 1, 0.3, 1);

		&.is-open {
			opacity: 1;
			pointer-events: auto;
			transform: translateY(0) scale(1);
		}
	}

	.mobile-settings-popover {
		right: 0;
		bottom: calc(100% + 0.75rem);
		width: 16rem;
	}

	.desktop-settings-popover {
		right: 100%;
		bottom: calc(100% + 1rem);
		width: 14rem;
		transform: translate(100%, -0.25rem) scale(0.5);

		&.is-open {
			transform: translate(100%, 0) scale(1);
		}
	}

	.settings-menu {
		margin: 0;
		padding: 0;
		list-style: none;
		color: #ffffff;

		li + li {
			border-top: 1px dashed rgba(255, 255, 255, 0.1);
		}

		svg {
			width: 1.25rem;
			height: 1.25rem;
			flex-shrink: 0;
		}
	}

	.settings-menu-info,
	.settings-range-row {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 1rem;
		width: 100%;
		padding: 0.75rem;
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.15;
		text-transform: uppercase;
	}

	.settings-menu-info {
		&:hover {
			background: rgba(255, 255, 255, 0.25);
		}
	}

	.settings-range-row {
		button:active {
			opacity: 0.5;
		}

		input {
			width: 100%;
			min-width: 0;
			height: 0.5rem;
			appearance: none;
			border-radius: 999px;
			background: linear-gradient(to right, #ffffff 0%, #ffffff var(--range-value), rgba(255, 255, 255, 0.16) var(--range-value), rgba(255, 255, 255, 0.16) 100%);
			cursor: pointer;
			outline: none;

			&::-webkit-slider-thumb {
				width: 1.25rem;
				height: 1.25rem;
				appearance: none;
				border: 0;
				border-radius: 999px;
				background: #ffffff;
			}

			&::-moz-range-thumb {
				width: 1.25rem;
				height: 1.25rem;
				border: 0;
				border-radius: 999px;
				background: #ffffff;
			}
		}
	}

	.option-modal {
		position: absolute;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem 0.75rem;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		opacity: 0;
		pointer-events: none;
		transition: opacity 200ms ease;

		&.is-open {
			opacity: 1;
			pointer-events: auto;
		}
	}

	.mobile-only-modal {
		display: flex;
	}

	.options-panel {
		position: relative;
		width: 100%;
		max-width: 40rem;
		height: auto;
		max-height: 100%;
		overflow: auto;
		border: 2px solid var(--ui-border);
		border-radius: 1rem;
		background: var(--ui-black-strong);
		padding: 1rem;
		box-shadow: var(--ui-shadow-panel);
		backdrop-filter: blur(8px);
		color: #ffffff;
	}

	.anchored-options-panel {
		position: absolute;
		z-index: 50;
		display: none;
		opacity: 0;
		pointer-events: none;
		transform: translateY(-0.25rem) scale(0.9);
		transition:
			opacity 100ms var(--ui-ease),
			transform 100ms var(--ui-ease);

		&.is-open {
			opacity: 1;
			pointer-events: auto;
			transform: translateY(0) scale(1);
		}

		&.is-measuring {
			opacity: 0;
			transform: translateY(0) scale(1);
		}
	}

	.options-title {
		margin: 0 2.5rem 1rem 0;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1;
		text-transform: uppercase;
		color: var(--ui-white-soft);
		filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.35));
	}

	.options-close-button {
		position: absolute;
		right: 0.5rem;
		top: 0.5rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		background: rgba(0, 0, 0, 0.5);
		color: #ffffff;

		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}

		svg {
			width: 66.666%;
			height: 66.666%;
		}
	}

	.bet-options-grid,
	.autobet-options-grid {
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.75rem;
		list-style: none;
	}

	.bet-options-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.autobet-options-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.option-choice,
	.autobet-choice {
		width: 100%;
		border: 1px solid rgba(255, 255, 255, 0.05);
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
		font-weight: 700;
		line-height: 1.2;
		text-align: center;
		transition:
			transform 150ms ease,
			background 150ms ease;
		outline: 2px solid transparent;
		outline-offset: 2px;

		&:focus-visible {
			outline-color: #ffffff;
		}

		&:hover {
			background: rgba(255, 255, 255, 0.2);
		}

		&:active {
			transform: scale(0.95);
		}

		&.is-selected {
			background: #ffffff;
			color: #000000;
			box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.125), inset 0 1px 1px 0 rgba(255, 255, 255, 0.125);
		}
	}

	.option-choice {
		border-radius: .3125rem;
		padding: 0.25rem 0.75rem;
		font-size: 1rem;
	}

	.autobet-choice {
		border-radius: 0.5rem;
		padding: 1rem 0.75rem;
		font-size: 1.875rem;
	}

	.bonus-overlay {
		position: absolute;
		inset: 0;
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(12px);
		color: var(--ui-accent);
		pointer-events: auto;
	}

	.bonus-close-button {
		position: absolute;
		right: 1.25rem;
		top: 1.25rem;
		z-index: 1;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		background: rgba(0, 0, 0, 0.5);
		color: #ffffff;

		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}

		svg {
			width: 66.666%;
			height: 66.666%;
		}
	}

	.bonus-scroller {
		width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 0.75rem 0 0.375rem;

		&::-webkit-scrollbar {
			height: 0.375rem;
		}

		&::-webkit-scrollbar-thumb {
			border-radius: 0.25rem;
			background: rgba(255, 255, 255, 0.2);
		}
	}

	.bonus-card-row {
		width: max-content;
		margin-inline: auto;
		display: flex;
		align-items: stretch;
		gap: 0.75rem;
		padding-inline: 0.75rem;
	}

	.bonus-card {
		position: relative;
		width: 10rem;
		min-width: 0;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 2px solid var(--ui-border);
		border-radius: 1rem;
		background: var(--ui-black);
		animation: bonus-appear 300ms both;
		transition:
			opacity 200ms ease,
			filter 200ms ease;

		&.is-disabled {
			opacity: 0.45;
			filter: grayscale(1);
		}

		> i {
			position: absolute;
			inset: 0;
			z-index: 2;
			border-radius: calc(1rem - 2px);
			box-shadow: var(--ui-shadow-panel);
			pointer-events: none;
		}
	}

	.bonus-card-media,
	.bonus-confirm-media {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background-color: rgb(255 255 255 / 0.1);
	}

	.bonus-card-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		text-align: center;

		h3 {
			margin: 0;
			color: #ffffff;
			font-size: 1rem;
			font-weight: 700;
			line-height: 1;
			text-transform: uppercase;
			text-wrap: balance;
			filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.4));
		}

		p {
			margin: 0.75rem 0 0;
			color: rgba(255, 255, 255, 0.8);
			font-size: 0.875rem;
			font-weight: 600;
			line-height: 1.35;
			text-wrap: balance;
		}
	}

	.bonus-card-action {
		margin-top: auto;
		padding-top: 0.75rem;
	}

	.bonus-price {
		border-radius: 0.5rem 0.5rem 0 0;
		background: rgba(255, 255, 255, 0.2);
		padding: 0.375rem 0.5rem;
		color: #ffffff;
		font-weight: 700;
		line-height: 1;
	}

	.bonus-price-large {
		font-size: 1.125rem;
	}

	.bonus-price-medium {
		font-size: 1rem;
	}

	.bonus-price-small {
		font-size: 0.875rem;
	}

	.bonus-action-button {
		width: 100%;
		border-radius: 0 0 0.5rem 0.5rem;
		background: currentColor;
		padding: 0.625rem 0.5rem;
		color: var(--ui-accent);
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.125), inset 0 1px 0 0 rgba(255, 255, 255, 0.25), inset 0 -2px 0 0 rgba(0, 0, 0, 0.25);
		transition:
			transform 200ms ease,
			filter 200ms ease;

		span {
			color: #ffffff;
		}

		&.activate {
			background: #ffffff;
			color: #000000;
		}

		&.active {
			background: var(--ui-accent);
			color: #ffffff;
		}

		&:disabled {
			background: rgba(255, 255, 255, 0.1);
			color: rgba(255, 255, 255, 0.4);
			box-shadow: none;
		}

		&:not(:disabled):hover {
			filter: brightness(1.1);
		}

		&:not(:disabled):active {
			transform: scale(0.98);
		}
	}

	.bonus-footer {
		width: 100%;
		max-width: 28rem;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: space-around;
		gap: 0.75rem;
		padding: 0.375rem 0.75rem 0;
	}

	.bonus-balance,
	.bonus-bet-controls {
		border: 2px solid var(--ui-border);
		border-radius: 1rem;
		background: var(--ui-black);
		box-shadow: var(--ui-shadow-panel);
		animation: bonus-appear 300ms both;
		min-height: 4.5rem;
	}

	.bonus-balance {
		order: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0;
		padding: 0.75rem;
	}

	.bonus-bet-controls {
		order: 1;
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;

		> button:not(.bonus-bet-label) {
			width: 2.75rem;
			height: 2.75rem;
			display: flex;
			align-items: center;
			justify-content: center;
			border: 2px solid rgba(255, 255, 255, 0.15);
			border-radius: 0.375rem;
			background: rgba(0, 0, 0, 0.6);
			color: #ffffff;

			&:disabled {
				background: rgba(0, 0, 0, 0.3);
				color: rgba(255, 255, 255, 0.35);
			}
		}

		svg {
			width: 66.666%;
			height: 66.666%;
		}
	}

	.bonus-bet-label {
		min-width: 5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		align-self: stretch;
		border: 0;
		border-radius: .3125rem;
		text-align: center;

		&:hover {
			background: rgba(255, 255, 255, 0.25);

			> strong {
				text-decoration: underline;
			}
		}
	}

	.bonus-confirm-backdrop {
		position: absolute;
		inset: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-inline: 1.75rem;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
	}

	.bonus-confirm-dialog {
		width: 100%;
		max-width: 24rem;
		overflow: hidden;
		border: 2px solid var(--ui-border);
		border-radius: 1rem;
		background: rgba(0, 0, 0, 0.9);
		box-shadow: var(--ui-shadow-panel), 0 24px 80px rgba(0, 0, 0, 0.55);
		animation: bonus-appear 300ms both;

		h3 {
			margin: 0;
			color: #ffffff;
			font-size: 1.5rem;
			font-weight: 700;
			line-height: 1;
			text-transform: uppercase;
			text-wrap: balance;
			filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.4));
		}

		p {
			min-height: 3rem;
			margin: 1rem 0 0;
			color: rgba(255, 255, 255, 0.8);
			font-size: 1rem;
			font-weight: 600;
			line-height: 1.35;
			text-wrap: balance;
		}

		.bonus-confirm-body > div {
			margin-top: 1.25rem;
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 0.75rem;
		}
	}

	.bonus-confirm-body {
		padding: 1.25rem;
		text-align: center;
	}

	.confirm-cancel-button,
	.confirm-action-button {
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		transition: transform 150ms ease;

		&:active {
			transform: scale(0.98);
		}
	}

	.confirm-action-button {
		background: currentColor;
		color: var(--ui-accent);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.125), inset 0 1px 0 0 rgba(255, 255, 255, 0.25), inset 0 -2px 0 0 rgba(0, 0, 0, 0.25);

		span {
			color: #ffffff;
		}

		&.activate {
			background: var(--ui-accent);
			color: #000000;

			span {
				color: #000000;
			}
		}
	}

	.confirm-cancel-button {
		border: 2px solid rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
	}

	.active-bonus-banner {
		position: fixed;
		inset: 0 0 auto;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--ui-accent);
		color: #000000;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
		animation: fade-out 3200ms both;
		pointer-events: none;

		span {
			font-size: 0.875rem;
			font-weight: 700;
		}
	}

	@container universal-ui (min-width: 640px) {
		.controls {
			bottom: 0.75rem;
			inset-inline: 0.75rem;
			height: 3.5rem;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			gap: 0.5rem;
		}

		.mobile-controls {
			display: none;
		}

		.desktop-controls {
			position: relative;
			width: 100%;
			height: 3.5rem;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 0.5rem;
		}

		.active-bonus-banner {
			display: none;
		}

		.desktop-active-bonus {
			position: absolute;
			inset-inline: 0;
			top: -0.25rem;
			height: 2rem;
			display: flex;
			align-items: center;
			justify-content: center;
			transform: translateY(-100%);
			pointer-events: none;

			span {
				border-radius: 999px;
				background: var(--ui-black);
				padding: 0.25rem 1rem;
				color: #ffffff;
				font-size: 0.875rem;
				font-weight: 700;
				box-shadow: var(--ui-shadow-panel);
				animation: fade-out 3200ms both;
			}
		}

		.settings-square {
			width: 2.5rem;
			height: 2.5rem;
			border-radius: 0.5rem;
		}

		.bonus-square {
			width: 3.5rem;
			height: 3.5rem;
			border-radius: 0.5rem;
		}

		.desktop-settings-wrap {
			position: relative;
		}

		.desktop-info-bar {
			position: relative;
			margin-right: 0.5rem;
			height: 100%;
			flex: 1;
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.5rem 0 0.5rem 1rem;
		}

		.spin-cutout {
			position: absolute;
			inset: 0;
			z-index: 0;
			border-radius: 0.5rem;
			background: rgba(0, 0, 0, 0.6);
			pointer-events: none;
			mask-image: radial-gradient(circle 40px at calc(100% - 32px) 50%, transparent 40px, #000 40.01px);
			-webkit-mask-image: radial-gradient(circle 40px at calc(100% - 32px) 50%, transparent 40px, #000 40.01px);
		}

		.info-content {
			position: relative;
			z-index: 1;
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 0.5rem;
		}

		.label-button strong,
		.label-group strong,
		.bet-label-button strong {
			font-size: 1.125em;
		}

		.desktop-bet-anchor {
			display: flex;
			align-items: center;
			gap: 0.25rem;
		}

		.desktop-bet-steppers {
			display: flex;
			flex-direction: column;
			gap: 0.125rem;

			button {
				width: 1.25rem;
				height: 1.25rem;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 0.125rem;
				background: rgba(0, 0, 0, 0.5);
				color: #ffffff;

				&:hover {
					background: rgba(255, 255, 255, 0.25);
				}

				&:disabled {
					background: rgba(0, 0, 0, 0.3);
					opacity: 0.4;
				}
			}

			svg {
				width: 1.25rem;
				height: 1.25rem;
			}
		}

		.desktop-spin-slot {
			position: relative;
			z-index: 1;
			width: 5rem;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: -0.5rem;
		}

		.desktop-spin-button {
			width: 5rem;
			height: 5rem;
		}

		.desktop-side-actions {
			display: flex;
			flex-direction: column;
			gap: 0.125rem;
		}

		.desktop-mini-button {
			width: 1.75rem;
			height: 1.75rem;
			border-radius: .3125rem;
		}

		.mobile-only-modal {
			display: none;
		}

		.anchored-options-panel {
			display: block;
		}

		.bet-options-grid.bet-grid-wide {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}

		.bet-options-grid.bet-grid-compact {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.option-modal {
			align-items: flex-end;
		}

		.bonus-footer {
			flex-direction: row;
			align-items: center;
		}

		.bonus-balance {
			order: 1;
			flex: 1;
		}

		.bonus-bet-controls {
			order: 2;
		}
	}

	.ui-compact .controls {
		bottom: 0;
		inset-inline: 0;
		height: auto;
		flex-direction: column;
	}

	.ui-compact .mobile-controls {
		display: flex;
	}

	.ui-compact .desktop-controls {
		display: none;
	}

	.ui-desktop-lock .mobile-controls {
		display: none;
	}

	.ui-desktop-lock .desktop-controls {
		display: flex;
	}

	@keyframes bonus-appear {
		from {
			opacity: 0;
			transform: translateY(10px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes fade-out {
		0%,
		72% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
