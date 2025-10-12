<script lang="ts">
	import { Divider, Slider, Switch } from "m3-svelte";
	import { Settings } from "$lib/stores/settings";
	import { name } from "./+page.svelte";
	import Dropdown from "$lib/ui/Dropdown.svelte";
</script>

<div class="flex flex-col gap-2 px-1 overflow-hidden">
	<div class="flex flex-row justify-between items-center">
		{@render name("Volume", "Volume of the video player.")}
		<Slider
			bind:value={$Settings.playerSettings.volume}
			min={0}
			max={1}
			format={v => `${(v * 100).toFixed(0)}%`}
		/>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name("Size Mode", "Change how the video reacts to the window size.")}
		<Dropdown
			bind:value={$Settings.playerSettings.sizeMode}
			type="textfield"
			label="Size Mode"
			options={[
				{ value: "fill", text: "Fill (stretched)" },
				{ value: "fit", text: "Fit (black bars)" },
				{ value: "zoom", text: "Zoom (zoomed in)" },
			]}
		/>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name(
			"Auto fullscreen",
			"Automatically switch to fullscreen mode when the video starts playing.",
		)}

		<label for={null}>
			<Switch bind:checked={$Settings.playerSettings.autoFullscreen} />
		</label>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name("Auto play", "Automatically play the video when it's loaded.")}

		<label for={null}>
			<Switch bind:checked={$Settings.playerSettings.autoPlay} />
		</label>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name("Snackbar timeout", "How long the snackbar should be visible for.")}
		<Slider
			bind:value={$Settings.playerSettings.snackTimeout}
			min={0}
			max={20000}
			format={v => `${(v / 1000).toFixed(1)}s`}
		/>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name("Prompt before progress change", "Ask before updating your progress on AniList.")}

		<label for={null}>
			<Switch bind:checked={$Settings.playerSettings.promptBeforeProgressChange} />
		</label>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name(
			"Show snackbar on progress change",
			"Show a snackbar when your AniList progress gets updated.",
		)}

		<label for={null}>
			<Switch bind:checked={$Settings.playerSettings.showSnackbarOnProgressChange} />
		</label>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name(
			"Pause on leave",
			"Set the status on AniList to paused when you leave the player.",
		)}

		<label for={null}>
			<Switch bind:checked={$Settings.playerSettings.pauseOnLeave} />
		</label>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name("Controls timeout", "How long the controls should be visible for.")}
		<Slider
			bind:value={$Settings.playerSettings.controlsTimeout}
			min={0}
			max={20000}
			format={v => `${(v / 1000).toFixed(1)}s`}
		/>
	</div>
</div>
