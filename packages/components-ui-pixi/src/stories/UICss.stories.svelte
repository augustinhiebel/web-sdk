<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UICssStory from './UICssStory.svelte';

	const { Story } = defineMeta({
		title: 'UI/CSS Bottom Board',
		args: {},
	});
</script>

<Story name="Default desktop">
	{#snippet template()}
		<UICssStory variant="default" />
	{/snippet}
</Story>

<Story name="Mobile portrait">
	{#snippet template()}
		<UICssStory variant="mobile" />
	{/snippet}
</Story>

<Story name="Menu/settings open">
	{#snippet template()}
		<UICssStory variant="settings" />
	{/snippet}
</Story>

<Story name="Bet options open">
	{#snippet template()}
		<UICssStory variant="bet" />
	{/snippet}
</Story>

<Story name="Autoplay options open">
	{#snippet template()}
		<UICssStory variant="autobet" />
	{/snippet}
</Story>

<Story name="Bonus modal">
	{#snippet template()}
		<UICssStory variant="bonus-modal" />
	{/snippet}
</Story>

<Story name="Bonus confirmation">
	{#snippet template()}
		<UICssStory variant="bonus-confirmation" />
	{/snippet}
</Story>

<Story name="Autoplay active">
	{#snippet template()}
		<UICssStory variant="autoplay" />
	{/snippet}
</Story>

<Story name="Free spins active">
	{#snippet template()}
		<UICssStory variant="free-spins" />
	{/snippet}
</Story>

<Story name="Bonus active/show win/extras">
	{#snippet template()}
		<UICssStory variant="bonus-active" />
	{/snippet}
</Story>
