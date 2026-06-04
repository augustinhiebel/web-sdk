import { POPOVER_GAP, POPOVER_MARGIN } from './constants';

export const parseCurrencyValue = (value: unknown) => Number(String(value).replace(/[$,]/g, ''));

export const formatCurrencyValue = (value: number, currency = 'USD') =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);

export const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

export function getGameBoundsSnapshot(gameElement: HTMLElement | undefined) {
	if (!gameElement) return { width: 0, height: 0, left: 0, top: 0 };
	const gameRect = gameElement.getBoundingClientRect();
	return {
		width: gameRect.width,
		height: gameRect.height,
		left: gameRect.left,
		top: gameRect.top,
	};
}

export function getLocalAnchorRect(anchorElement: HTMLElement | undefined, bounds: any) {
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

export function getAdaptivePopoverLayout({
	anchorRect,
	panelSize,
	boundsSize,
	preferredAlignment = 'right',
	preferredWidth,
	compactWidth,
	maxHeight,
	forceModalWhenConstrained = false,
}: any) {
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
		mode:
			fitsPreferredWidth && canFitAbove && Math.abs(left - unclampedLeft) < 1
				? 'anchored'
				: 'repositioned',
		left,
		top,
		width,
		maxHeight: maxPanelHeight,
		gridColumns: fitsPreferredWidth ? 'wide' : 'compact',
		transformOrigin: shouldPlaceBelow ? 'top right' : 'bottom right',
		isPositionReady: Boolean(measuredPanelHeight),
	};
}
