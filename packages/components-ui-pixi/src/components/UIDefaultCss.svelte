<script lang="ts">
	import type { Snippet } from 'svelte';

	import { EnableSpaceHold } from 'components-shared';
	import { Container } from 'pixi-svelte';

	import { getContext } from '../context';
	import UICss from './UICss.svelte';

	type Props = {
		gameName: Snippet;
		logo: Snippet;
	};

	const props: Props = $props();
	const context = getContext();
</script>

<EnableSpaceHold />

<Container x={20}>
	{@render props.gameName()}
</Container>

<Container x={context.stateLayoutDerived.canvasSizes().width - 20}>
	{@render props.logo()}
</Container>

<div class="ui-css-default">
	<UICss />
</div>

<style>
	.ui-css-default {
		position: fixed;
		inset: 0;
		z-index: 10;
		pointer-events: none;
	}
</style>
