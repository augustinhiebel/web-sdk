export const BET_OPTIONS = [
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

export const AUTOBET_OPTIONS = ['∞', '10', '25', '50', '100', '200', '300', '500', '1000'];
export const FALLBACK_USER_BALANCE = 100;
export const POPOVER_MARGIN = 12;
export const POPOVER_GAP = 16;

export const closeIconPath =
	'M14.828,12l2.828-2.828c.391-.391,.391-1.024,0-1.414l-1.414-1.414c-.391-.391-1.024-.391-1.414,0l-2.828,2.828-2.828-2.828c-.391-.391-1.024-.391-1.414,0l-1.414,1.414c-.391,.391-.391,1.024,0,1.414l2.828,2.828-2.828,2.828c-.391,.391-.391,1.024,0,1.414l1.414,1.414c.391,.391,1.024,.391,1.414,0l2.828-2.828,2.828,2.828c.391,.391,1.024,.391,1.414,0l1.414-1.414c.391-.391,.391-1.024,0-1.414l-2.828-2.828Z';

export const BONUS_OPTIONS = [
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
