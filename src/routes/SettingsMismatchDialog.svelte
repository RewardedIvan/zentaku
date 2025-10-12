<script lang="ts">
	import { Button, Dialog } from "m3-svelte";

	import Tooltip from "$lib/ui/Tooltip.svelte";
	import { Settings } from "$lib/stores/settings";
	import ExportImport from "./(main)/settings/ExportImport.svelte";

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	function close() {
		open = false;
	}

	function bumpVersion() {
		$Settings.version = Settings.defaultValue.version;
		open = false;
	}

	function update() {
		$Settings.version = Settings.defaultValue.version;
		$Settings = { ...Settings.defaultValue, ...$Settings };
		open = false;
	}

	function reset() {
		$Settings = { ...Settings.defaultValue };
		open = false;
	}
</script>

<Dialog headline="Settings version mismatch" bind:open>
	<span>
		Your settings are from a {$Settings.version > Settings.defaultValue.version ? "newer" : "older"}
		version of zentaku.
	</span>

	{#snippet buttons()}
		<Tooltip>
			<Button variant="text" onclick={close}>Don't care</Button>

			{#snippet tooltip()}
				<span>Does nothing</span>
			{/snippet}
		</Tooltip>
		<ExportImport />
		<Tooltip>
			<Button variant="tonal" onclick={reset}>Reset</Button>

			{#snippet tooltip()}
				<span>Reset settings to defaults</span>
			{/snippet}
		</Tooltip>
		<Tooltip>
			<Button variant="tonal" onclick={bumpVersion}>Trust me bro</Button>

			{#snippet tooltip()}
				<span>Bumps the version number</span>
			{/snippet}
		</Tooltip>
		{#if $Settings.version < Settings.defaultValue.version}
			<Tooltip>
				<Button variant="filled" onclick={update}>Update</Button>

				{#snippet tooltip()}
					<span>Fills in the new settings with the new defaults</span>
				{/snippet}
			</Tooltip>
		{/if}
	{/snippet}
</Dialog>
