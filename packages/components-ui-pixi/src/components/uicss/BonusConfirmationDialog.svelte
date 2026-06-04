<script lang="ts">
	// @ts-nocheck
	type Props = {
		pendingBonus: any;
		activeBonusName?: string | null;
		onCancel: () => void;
		onConfirm: () => void;
		onBackdropCancel: (event: Event) => void;
	};

	let { pendingBonus, activeBonusName = null, onCancel, onConfirm, onBackdropCancel }: Props =
		$props();
</script>

{#if pendingBonus}
	<div role="presentation" class="bonus-confirm-backdrop" onclick={onBackdropCancel}>
		<div
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-labelledby="bonus-confirmation-title"
			class="bonus-confirm-dialog"
		>
			<div class="bonus-confirm-media"></div>
			<div class="bonus-confirm-body">
				<h3 id="bonus-confirmation-title">{pendingBonus.name}</h3>
				<p>
					{pendingBonus.actionType === 'activate'
						? pendingBonus.description
						: `${pendingBonus.priceLabel} will be subtracted from your balance`}
				</p>
				<div>
					<button type="button" onclick={onCancel} class="confirm-cancel-button">Cancel</button>
					<button
						type="button"
						onclick={onConfirm}
						class="confirm-action-button"
						class:activate={pendingBonus.actionType === 'activate'}
					>
						<span>
							{pendingBonus.actionType === 'activate'
								? activeBonusName === pendingBonus.name
									? 'Deactivate'
									: 'Activate'
								: 'Buy'}
						</span>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
