<script lang="ts">
	import { FAB } from "m3-svelte";
	import type { VideoSource } from "$lib/source";
	import { TrustStore, hashSource } from "$lib/stores/SourceStores";
	import { invoke } from "@tauri-apps/api/core";
	import { fetch as unsafeFetch } from "$lib/tauri";
	import type { IconifyIcon } from "@iconify/types";
	import Tooltip from "$lib/ui/Tooltip.svelte";

	import PlayIcon from "@ktibow/iconset-material-symbols/play-arrow";
	import FolderIcon from "@ktibow/iconset-material-symbols/folder";
	import RefreshIcon from "@ktibow/iconset-material-symbols/refresh";
	import TrustIcon from "@ktibow/iconset-material-symbols/security";

	import TrustDialog from "./TrustDialog.svelte";
	import WarningDialog from "./WarningDialog.svelte";
	import Source from "./Source.svelte";

	interface Props {
		search: (source: VideoSource<unknown>) => void;
		clearResults: () => void;
	}

	const { search, clearResults }: Props = $props();

	let warningOpen = $state(false);
	let trustDialogOpen = $state(false);
	let sources: VideoSource<unknown>[] = $state([]);

	async function openWarning() {
		const scripts = await invoke<Record<string, string>>("get_sources");

		warningOpen = (
			await Promise.all(
				Object.entries(scripts).map(async ([_fileName, script]) => {
					return Object.hasOwn($TrustStore, await hashSource(script));
				}),
			)
		).includes(false);

		if (!warningOpen) {
			refreshSources();
		}
	}

	async function refreshSources() {
		warningOpen = false;

		clearResults();
		const scripts = await invoke<Record<string, string>>("get_sources");
		sources = Object.entries(scripts)
			.map(([_fileName, script]) => {
				// @ts-ignore
				window.unsafeFetch = unsafeFetch;
				return eval(`(() => { ${script} })()`);
			})
			.sort((a, b) => a.name.localeCompare(b.name));

		// trust

		let newEntries = Object.fromEntries(
			await Promise.all(
				Object.entries(scripts).map(async ([_fileName, script]) => {
					let scriptHash = await hashSource(script);
					return [scriptHash, script];
				}),
			),
		);

		TrustStore.update(current => ({ ...current, ...newEntries }));
	}

	openWarning();
</script>

<TrustDialog bind:open={trustDialogOpen} />
<WarningDialog bind:open={warningOpen} {refreshSources} />

<div class="flex flex-col w-[90dvw] bg-surface-container-high">
	{#if sources.length}
		{#each sources as source, i}
			<Source {search} {source} isLast={i == sources.length - 1} />
		{/each}
	{:else}
		<span>No sources, add some in the sources directory</span>
	{/if}
</div>

<div class="flex flex-row justify-end gap-2 mt-2">
	{@render tooltipFab(TrustIcon, () => (trustDialogOpen = true), "Trusted sources")}
	{@render tooltipFab(RefreshIcon, openWarning, "Refresh sources")}
	{@render tooltipFab(FolderIcon, () => invoke("open_source_dir"), "Open sources' directory")}
	{@render tooltipFab(PlayIcon, () => {}, "Continue")}
</div>

{#snippet tooltipFab(icon: IconifyIcon, onclick: () => void, tooltipText: string)}
	<Tooltip>
		<FAB {icon} size="small" on:click={onclick} />
		{#snippet tooltip()}
			<span>{tooltipText}</span>
		{/snippet}
	</Tooltip>
{/snippet}
