<script lang="ts">
	import { FAB } from "m3-svelte";
	import type { VideoSource } from "$lib/source";
	import { getScripts, trustScripts, areAllScriptsTrusted, loadScripts } from "$lib/utils/Sources";
	import { invoke } from "@tauri-apps/api/core";
	import type { IconifyIcon } from "@iconify/types";
	import Tooltip from "$lib/ui/Tooltip.svelte";
	import { Progress } from "$lib/stores/Player";
	import { page } from "$app/state";

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
		continu: () => void;
	}

	const { search, clearResults, continu }: Props = $props();

	let warningOpen = $state(false);
	let trustDialogOpen = $state(false);
	let sources: VideoSource<unknown>[] = $state([]);
	let progress = $derived(
		$Progress.find(p => p.anilistId == Number(page.url.searchParams.get("id"))),
	);

	async function openWarning() {
		warningOpen = !(await areAllScriptsTrusted());

		if (!warningOpen) {
			refreshSources();
		}
	}

	async function refreshSources() {
		warningOpen = false;
		clearResults();

		const scripts = await getScripts();
		sources = await loadScripts(scripts);
		await trustScripts(scripts);
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
	{#if progress != null}
		{@render tooltipFab(
			PlayIcon,
			continu,
			`Continue (ep${progress.currentEpisode} on "${progress.source}")`,
		)}
	{/if}
</div>

{#snippet tooltipFab(icon: IconifyIcon, onclick: () => void, tooltipText: string)}
	<Tooltip>
		<FAB {icon} size="small" {onclick} />
		{#snippet tooltip()}
			<span>{tooltipText}</span>
		{/snippet}
	</Tooltip>
{/snippet}
