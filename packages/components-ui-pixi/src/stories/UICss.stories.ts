import type { Meta, StoryObj } from '@storybook/svelte';

import UICssStory from './UICssStory.svelte';

const meta = {
	title: 'UI/CSS Bottom Board',
	component: UICssStory,
	argTypes: {
		variant: {
			control: 'select',
			options: [
				'default',
				'mobile',
				'settings',
				'bet',
				'autobet',
				'bonus-modal',
				'bonus-confirmation',
				'autoplay',
				'bonus-active',
			],
		},
	},
} satisfies Meta<typeof UICssStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultDesktop: Story = {
	args: {
		variant: 'default',
	},
};

export const MobilePortrait: Story = {
	args: {
		variant: 'mobile',
	},
};

export const MenuSettingsOpen: Story = {
	args: {
		variant: 'settings',
	},
};

export const BetOptionsOpen: Story = {
	args: {
		variant: 'bet',
	},
};

export const AutoplayOptionsOpen: Story = {
	args: {
		variant: 'autobet',
	},
};

export const BonusModal: Story = {
	args: {
		variant: 'bonus-modal',
	},
};

export const BonusConfirmation: Story = {
	args: {
		variant: 'bonus-confirmation',
	},
};

export const AutoplayActive: Story = {
	args: {
		variant: 'autoplay',
	},
};

export const BonusActiveShowWinExtras: Story = {
	args: {
		variant: 'bonus-active',
	},
};
