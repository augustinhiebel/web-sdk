<script lang="ts">
	import UICss from '../components/UICss.svelte';

	type Variant =
		| 'default'
		| 'mobile'
		| 'settings'
		| 'bet'
		| 'autobet'
		| 'bonus-modal'
		| 'bonus-confirmation'
		| 'autoplay'
		| 'bonus-active';

	type Props = {
		variant?: Variant;
	};

	let { variant = 'default' }: Props = $props();

	const isMobile = $derived(variant === 'mobile');
	const isSettings = $derived(variant === 'settings');
	const isBet = $derived(variant === 'bet');
	const isAutobetOptions = $derived(variant === 'autobet');
	const isBonusModal = $derived(variant === 'bonus-modal' || variant === 'bonus-confirmation');
	const isBonusConfirmation = $derived(variant === 'bonus-confirmation');
	const isAutoplay = $derived(variant === 'autoplay');
	const isBonusActive = $derived(variant === 'bonus-active');
	const balance = $derived(isBonusActive ? '$2,410.00' : '$2,450.00');
	const win = $derived(isAutoplay ? '$12.40' : isBonusActive ? '$840.00' : '$0.00');
	const bet = $derived(isBonusActive ? '$20.00' : '$10.00');
	const menuOpen = $derived(isSettings ? true : undefined);
</script>

<div class="story-shell" class:story-shell-mobile={isMobile}>
	<div class="mock-game">
		<div class="mock-reels" class:mock-reels-mobile={isMobile}>
			<div></div>
			<div></div>
			<div></div>
			{#if !isMobile}
				<div></div>
				<div></div>
			{/if}
		</div>
		<UICss
			{balance}
			{win}
			{bet}
			showWin={isAutoplay || isBonusActive}
			showExtras={isBonusActive}
			{menuOpen}
			betOptionsOpen={isBet}
			autobetOptionsOpen={isAutobetOptions}
			bonusModalOpen={isBonusModal}
			bonusConfirmationOpen={isBonusConfirmation}
			autoSpinActive={isAutoplay}
			autoSpinCount={isAutoplay ? 25 : null}
			turboActive={isAutoplay}
			bonusActive={isBonusActive}
			layout={isMobile ? 'mobile' : 'auto'}
			disabled={false}
		/>
	</div>
</div>

<style>
	.story-shell {
		width: 100vw;
		height: 100vh;
		min-height: 520px;
		display: grid;
		place-items: center;
		padding: 0;
		background:
			radial-gradient(circle at 24% 18%, rgba(94, 255, 174, 0.18), transparent 28%),
			linear-gradient(135deg, #18202d, #0c1018 62%, #17131d);
	}

	.story-shell-mobile {
		min-height: 760px;
		padding: 16px;
	}

	.mock-game {
		position: relative;
		width: min(1200px, 100%);
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 18px;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0)),
			#131922;
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.46);
	}

	.story-shell-mobile .mock-game {
		width: min(390px, 100%);
		height: min(844px, calc(100vh - 32px));
		aspect-ratio: auto;
		border-radius: 22px;
	}

	.mock-game::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
		background-size: 42px 42px;
		mask-image: linear-gradient(to bottom, black, transparent 78%);
	}

	.mock-reels {
		position: absolute;
		inset: 9% 10% 27%;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 14px;
		padding: 16px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.05);
	}

	.mock-reels-mobile {
		inset: 10% 7% 34%;
		grid-template-columns: repeat(3, 1fr);
	}

	.mock-reels div {
		border-radius: 12px;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent),
			linear-gradient(135deg, #2e4057, #1e2735);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
	}
</style>
