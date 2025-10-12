<script lang="ts">
	import { Button, Divider, Dialog } from "m3-svelte";
	import { SourceSettings } from "$lib/stores/sourceStores";
	import SettingControl from "./SettingControl.svelte";

	interface Props {
		open: boolean;
		storeKey: string;
		defaultSettings: any;
	}

	let { open = $bindable(), defaultSettings, storeKey }: Props = $props();

	let copy = $state({ ...defaultSettings });

	$effect(() => {
		if (!open) {
			copy = { ...($SourceSettings[storeKey] ?? defaultSettings) };
		}
	});

	async function save() {
		$SourceSettings[storeKey] = copy;
		open = false;
	}

	async function reset() {
		$SourceSettings[storeKey] = { ...defaultSettings };
		open = false;
	}

	let copyFiltered = $derived(Object.entries(copy).filter(([key, _]) => !key.startsWith("_")));
</script>

<Dialog bind:open headline="Source Settings">
	<div class="flex flex-col gap-2 bg-surface-container-high flex-grow">
		{#each copyFiltered as [key, value]}
			<SettingControl {key} {value} {defaultSettings} onChange={(k, v) => (copy[k] = v)} {open} />
		{/each}
	</div>

	{#snippet buttons()}
		<Button variant="outlined" onclick={() => (open = false)}>Close</Button>
		<Button variant="tonal" onclick={reset}>Reset</Button>
		<Button variant="filled" onclick={save}>Save</Button>
	{/snippet}
</Dialog>
