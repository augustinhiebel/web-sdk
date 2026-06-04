<script lang="ts">
	// @ts-nocheck
	type Props = {
		musicVolume: number;
		soundVolume: number;
		updateMusicVolume: (event: Event) => void;
		updateSoundVolume: (event: Event) => void;
		toggleMusicVolume: () => void;
		toggleSoundVolume: () => void;
	};

	let {
		musicVolume,
		soundVolume,
		updateMusicVolume,
		updateSoundVolume,
		toggleMusicVolume,
		toggleSoundVolume,
	}: Props = $props();
</script>

<ul class="settings-menu">
	<li>
		<button type="button" class="settings-menu-info">
			<svg viewBox="0 0 24 24">
				<path
					d="m16.556,1H7.444L1,7.444v9.111l6.444,6.444h9.111l6.444-6.444V7.444l-6.444-6.444Zm-3.556,17h-2v-6h-2v-2h2.5c.827,0,1.5.673,1.5,1.5v6.5Zm-1-9.5c-.689,0-1.25-.561-1.25-1.25s.561-1.25,1.25-1.25,1.25.561,1.25,1.25-.561,1.25-1.25,1.25Z"
				/>
			</svg>
			<span>Game info</span>
		</button>
	</li>
	<li class="settings-range-row">
		<button
			aria-label="Toggle music volume"
			aria-pressed={musicVolume === 0}
			type="button"
			onclick={toggleMusicVolume}
		>
			<svg viewBox="0 0 24 24">
				{#if musicVolume === 0}
					<path
						d="M23.9196 0.61C23.8696 0.49 23.7996 0.38 23.7096 0.29C23.5096 0.09 23.2396 0 22.9796 0H7.99957C7.44957 0 6.99957 0.45 6.99957 1V15.58L6.88957 15.69C6.19957 15.25 5.37957 14.99 4.49957 14.99C2.01957 14.99 -0.00042969 17.01 -0.00042969 19.49C-0.00042969 20.37 0.25957 21.18 0.69957 21.87L0.28957 22.28C-0.10043 22.67 -0.10043 23.3 0.28957 23.69C0.48957 23.89 0.73957 23.98 0.99957 23.98C1.25957 23.98 1.50957 23.88 1.70957 23.69L2.10957 23.29L8.99957 16.4L17.4096 7.99L23.7096 1.69L23.9996 1.4V0.99C23.9996 0.86 23.9696 0.73 23.9196 0.6V0.61ZM8.99957 13.58V8H14.5796L8.99957 13.58ZM8.99957 19.24V19.5C8.99957 21.98 6.97957 24 4.49957 24C4.41957 24 4.33957 23.98 4.25957 23.98L8.99957 19.24ZM23.9996 4.24V17.5C23.9996 19.98 21.9796 22 19.4996 22C17.0196 22 14.9996 19.98 14.9996 17.5C14.9996 15.02 17.0196 13 19.4996 13C20.4196 13 21.2796 13.28 21.9996 13.76V8H20.2396L23.9996 4.24Z"
					/>
				{:else}
					<path
						d="M23,0H8C7.448,0,7,0.448,7,1v14.762C6.284,15.282,5.425,15,4.5,15C2.019,15,0,17.019,0,19.5S2.019,24,4.5,24 S9,21.981,9,19.5V8h13v5.762C21.284,13.282,20.425,13,19.5,13c-2.481,0-4.5,2.019-4.5,4.5s2.019,4.5,4.5,4.5s4.5-2.019,4.5-4.5V1 C24,0.448,23.552,0,23,0z"
					/>
				{/if}
			</svg>
		</button>
		<input
			aria-label="Music volume"
			type="range"
			min="0"
			max="100"
			value={musicVolume}
			oninput={updateMusicVolume}
			onchange={updateMusicVolume}
			style={`--range-value: ${musicVolume}%;`}
		/>
	</li>
	<li class="settings-range-row">
		<button
			aria-label="Toggle sound volume"
			aria-pressed={soundVolume === 0}
			type="button"
			onclick={toggleSoundVolume}
		>
			<svg viewBox="0 0 24 24">
				{#if soundVolume === 0}
					<path
						d="M10.567,17.675L17.4,22.8c0.176,0.133,0.388,0.2,0.6,0.2c0.152,0,0.306-0.035,0.447-0.105 C18.786,22.725,19,22.379,19,22V9.242L10.567,17.675z"
					/><path
						d="M2,17h5L19,5V2c0-0.379-0.214-0.725-0.553-0.895C18.109,0.938,17.703,0.973,17.4,1.2L9.667,7H2 C1.447,7,1,7.447,1,8v8C1,16.553,1.447,17,2,17z"
					/><path
						d="M1,24c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l22-22 c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414l-22,22C1.512,23.902,1.256,24,1,24z"
					/>
				{:else}
					<path
						d="M14.447,1.105C14.109,0.938,13.703,0.973,13.4,1.2L5.667,7H1C0.447,7,0,7.447,0,8v8c0,0.553,0.447,1,1,1 h4.667l7.733,5.8c0.176,0.133,0.388,0.2,0.6,0.2c0.152,0,0.306-0.035,0.447-0.105C14.786,22.725,15,22.379,15,22V2 C15,1.621,14.786,1.275,14.447,1.105z"
					/><rect x="18" y="11" width="6" height="2" /><rect
						x="16.392"
						y="5"
						width="6"
						height="2"
						transform="matrix(0.8661 -0.4999 0.4999 0.8661 -0.4024 10.4981)"
					/><rect
						x="18.392"
						y="15"
						width="2"
						height="6"
						transform="matrix(0.5 -0.866 0.866 0.5 -5.8923 25.7943)"
					/>
				{/if}
			</svg>
		</button>
		<input
			aria-label="Sound volume"
			type="range"
			min="0"
			max="100"
			value={soundVolume}
			oninput={updateSoundVolume}
			onchange={updateSoundVolume}
			style={`--range-value: ${soundVolume}%;`}
		/>
	</li>
</ul>
