<script lang="ts">
	import { Button, Divider, Icon, TextField } from "m3-svelte";
	import { name } from "./+page.svelte";
	import { Settings } from "$lib/stores/Settings";
	import { LSCache } from "$lib/stores/Cache";

	import DeleteIcon from "@ktibow/iconset-material-symbols/delete";

	import Tooltip from "$lib/ui/Tooltip.svelte";
</script>

<div class="flex flex-col gap-2 px-1 overflow-hidden">
	{#snippet clearCache(key: keyof typeof LSCache.defaultValue)}
		<Tooltip>
			<Button
				variant="text"
				iconType="full"
				onclick={() => LSCache.update(v => ({ ...v, [key]: {} }))}
			>
				<Icon icon={DeleteIcon} />
			</Button>
			{#snippet tooltip()}
				<span>Clear cache ({Object.keys($LSCache[key]).length} entries)</span>
			{/snippet}
		</Tooltip>
	{/snippet}

	<div class="flex flex-row justify-between items-center">
		{@render name("Media cache age", "How long to keep media in cache")}

		<div class="flex flex-row items-center gap-2">
			{@render clearCache("media")}
			<TextField bind:value={$Settings.cache.mediaClearAgeHours as any} label="Age in hours" />
		</div>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name(
			"Media list collection cache age",
			"How long to keep media list collections in cache",
		)}

		<div class="flex flex-row items-center gap-2">
			{@render clearCache("mediaListCollection")}
			<TextField
				bind:value={$Settings.cache.mediaListCollectionClearAgeHours as any}
				label="Age in hours"
			/>
		</div>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name("Profile cache age", "How long to keep your profile in cache")}

		<div class="flex flex-row items-center gap-2">
			{@render clearCache("viewer")}
			<TextField bind:value={$Settings.cache.viewerClearAgeHours as any} label="Age in hours" />
		</div>
	</div>
	<Divider />
	<div class="flex flex-row justify-between items-center">
		{@render name("Character cache age", "How long to keep characters in cache")}

		<div class="flex flex-row items-center gap-2">
			{@render clearCache("character")}
			<TextField bind:value={$Settings.cache.characterClearAgeHours as any} label="Age in hours" />
		</div>
	</div>
	<Divider />
	<!-- <div class="flex flex-row justify-between items-center">
		{@render name("Profile cache age", "How long to keep your profile in cache")}

		<div class="flex flex-row items-center gap-2">
			{@render clearCache("viewer")}
			<TextField bind:value={$Settings.cache.viewerClearAgeHours} label="Age in hours" />
		</div>
	</div>
	<Divider /> -->
	<div class="flex flex-row justify-between items-center">
		{@render name("Video URL cache age", "How long to keep video URLs (for the player) in cache")}

		<div class="flex flex-row items-center gap-2">
			{@render clearCache("videos")}
			<TextField bind:value={$Settings.cache.videoUrlClearAgeHours as any} label="Age in hours" />
		</div>
	</div>
</div>
