<script lang="ts">
	// @ts-nocheck
	import type { Snippet } from 'svelte';

	type Props = {
		label: string;
		active?: boolean;
		expanded?: boolean;
		pressed?: boolean;
		buttonClass?: string;
		type?: 'button' | 'submit' | 'reset';
		press?: (event: MouseEvent) => void;
		primary: Snippet;
		activeIcon: Snippet;
	};

	let {
		label,
		active = false,
		expanded,
		pressed,
		buttonClass = '',
		type = 'button',
		press,
		primary,
		activeIcon,
	}: Props = $props();
</script>

<button
	aria-label={label}
	aria-expanded={expanded}
	aria-pressed={pressed}
	{type}
	onclick={(event) => press?.(event)}
	class={buttonClass}
	class:is-active={active}
>
	<span class="toggle-icon">
		<svg class="toggle-primary" class:toggle-hidden={active} viewBox="0 0 24 24">
			{@render primary()}
		</svg>
		<svg class="toggle-active" class:toggle-visible={active} viewBox="0 0 24 24">
			{@render activeIcon()}
		</svg>
	</span>
</button>
