<script lang="ts">
	import { Button, Dialog } from "m3-svelte";
	import { get } from "svelte/store";
	import Tooltip from "$lib/ui/Tooltip.svelte";
	import { Settings, settingsMigrations } from "$lib/stores/settings";
	import ExportImport from "./(main)/settings/ExportImport.svelte";

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	const migrationKey = $derived(`${$Settings.version} -> ${Settings.defaultValue.version}`);

	function close() {
		open = false;
	}

	function bumpVersion() {
		$Settings.version = Settings.defaultValue.version;
		open = false;
	}

	function update() {
		$Settings.version = Settings.defaultValue.version;
		Settings.set({ ...Settings.defaultValue, ...$Settings });
		open = false;
	}

	function reset() {
		Settings.set({ ...Settings.defaultValue });
		open = false;
	}

	function migrate() {
		let scopy = { ...get(Settings) };
		settingsMigrations[migrationKey as keyof typeof settingsMigrations](scopy);
		Settings.set(scopy);
		open = false;
	}
</script>

<Dialog headline="Settings version mismatch" class="dilog m3-container" bind:open closedby="none">
	<p>
		Your settings are from a {$Settings.version > Settings.defaultValue.version ? "newer" : "older"}
		version of zentaku. ({migrationKey})
	</p>
	{#if migrationKey in settingsMigrations}
		<p>
			You're in luck, there is a migration for these versions. Choosing to migrate is recommended.
		</p>
	{/if}

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
				<span>Reset settings to default</span>
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
					<span>Fills in the missing (new) settings with the (new) defaults</span>
				{/snippet}
			</Tooltip>
		{/if}
		{#if migrationKey in settingsMigrations}
			<Tooltip>
				<Button variant="filled" onclick={migrate}>Migrate</Button>

				{#snippet tooltip()}
					<span>Changes your options to comform to the new format</span>
				{/snippet}
			</Tooltip>
		{/if}
	{/snippet}
</Dialog>

<style>
	:global(.dilog > .buttons) {
		flex-wrap: wrap;
	}
</style>
