<script lang="ts">
	import { name } from "./+page.svelte";
	import { Settings } from "$lib/stores/settings";
	import { Button, Divider, Switch } from "m3-svelte";
	import { invoke } from "@tauri-apps/api/core";
	import Dropdown from "$lib/ui/Dropdown.svelte";

	let restartDisabled = $state(false);

	async function restart() {
		restartDisabled = true;
		setTimeout(() => (restartDisabled = false), 5000);
		await invoke("restart_rpc");
	}
</script>

<div class="flex flex-col gap-2 px-1 overflow-hidden">
	<div class="flex flex-row justify-between items-center">
		{@render name("Enable", "Enable Discord Rich Presence")}

		<label for={null}>
			<Switch bind:checked={$Settings.drpc.enabled} />
		</label>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name("Empty state", "Shows only 'Zentaku'")}

		<label for={null}>
			<Switch bind:checked={$Settings.drpc.emptyState} />
		</label>
	</div>
	{#if !$Settings.drpc.emptyState}
		<Divider />
		<div class="flex flex-row justify-between items-center">
			{@render name("Show browsing activity", "Shows which anime/manga you're viewing")}

			<label for={null}>
				<Switch bind:checked={$Settings.drpc.browsingActivity} />
			</label>
		</div>
		<Divider />
		<div class="flex flex-row justify-between items-center">
			{@render name(
				"Show list activity",
				"Shows which tab you're on in your list page (anime/manga/feed)",
			)}

			<label for={null}>
				<Switch bind:checked={$Settings.drpc.listActivity} />
			</label>
		</div>
		<Divider />
		<div class="flex flex-row justify-between items-center">
			{@render name("Show anime activity", "Shows what anime you're watching")}

			<Dropdown
				options={[
					{
						value: "broad",
						description: "Shows only that you are watching",
					},
					{
						value: "show",
						description: "Includes the anime name",
					},
					{
						value: "detailed",
						description: "Includes the anime name, episode and it's title",
					},
				]}
				label="LOD"
				bind:value={$Settings.drpc.watchingActivity}
			/>
		</div>
		<Divider />
		<div class="flex flex-row justify-between items-center">
			{@render name("Show manga activity", "Shows what anime you're watching")}

			<Dropdown
				options={[
					{
						value: "broad",
						description: "Shows only that you are reading",
					},
					{
						value: "show",
						description: "Includes the manga name",
					},
					{
						value: "detailed",
						description: "Includes the manga name, chapter and it's title",
					},
				]}
				label="LOD"
				bind:value={$Settings.drpc.readingActivity}
			/>
		</div>
	{/if}
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name("Profile button", "Puts a button with a link to your AniList profile")}

		<label for={null}>
			<Switch bind:checked={$Settings.drpc.profileButton} />
		</label>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name("Github button", "Shameless self-promotion")}

		<label for={null}>
			<Switch bind:checked={$Settings.drpc.githubButton} />
		</label>
	</div>

	<Button onclick={restart} disabled={restartDisabled} variant="outlined">Restart RPC</Button>
</div>
