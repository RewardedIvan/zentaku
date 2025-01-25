<script module>
	export { name };
</script>

<script lang="ts">
	import { Settings } from "$lib/stores/Settings";
	import Ripple from "$lib/ui/Ripple.svelte";
	import { Spring } from "svelte/motion";

	import SettingsMismatchDialog from "./SettingsMismatchDialog.svelte";
	import PlayerSettings from "./PlayerSettings.svelte";
	import PlayerKeybinds from "./PlayerKeybinds.svelte";
	import Theme from "./Theme.svelte";

	let versionMismatchDialogOpen = $state(false);
	let scrollSection = $state("");
	let scroll = new Spring(0, {
		stiffness: 0.2,
		damping: 0.7,
	});

	$effect(() => {
		window.scroll(0, scroll.current);
	});

	function scrollId(id: string) {
		const elem = document.getElementById(id);
		if (!elem) return;
		scroll.set(elem.offsetTop - elem.clientHeight);
		scrollSection = id;
	}

	function onWheel() {
		const arr = Array.from(document.querySelectorAll("span[id]")).map(e => {
			const s = e as HTMLSpanElement;
			return { o: s.offsetTop - s.clientHeight - 25, s };
		});

		const i = arr.findIndex(e => window.scrollY < e.o);
		if (i != -1) {
			const prevI = Math.max(0, i - 1);
			scrollSection = arr[prevI].s.id;
		}
	}

	if ($Settings.version != Settings.defaultValue.version) {
		versionMismatchDialogOpen = true;
	}
</script>

<svelte:window onwheel={onWheel} />

{#snippet name(name: string, description: string)}
	<div class="flex flex-col">
		<span class="text-xl text-primary">{name}</span>
		<span class="text-sm text-secondary">{description}</span>
	</div>
{/snippet}

<SettingsMismatchDialog bind:open={versionMismatchDialogOpen} />

{#if !versionMismatchDialogOpen}
	<div class="flex flex-row gap-2 px-4 pt-4">
		<!-- this is kinda hardcoded, well so is the topbar.. TODO: add to tailwind -->
		<div class="flex flex-col sticky overflow-auto top-[56px] h-[calc(100vh-56px)] w-40">
			{#snippet category(name: string)}
				{@const selected = scrollSection == name.toLowerCase()}

				<Ripple
					class="rounded-sm p-2 flex items-start {selected ? 'bg-primary-container' : ''}"
					onClick={() => scrollId(name.toLowerCase())}
				>
					<span>{name}</span>
				</Ripple>
			{/snippet}

			{@render category("Theme")}
			{@render category("Player")}
			{@render category("Player keybinds")}
		</div>
		<div class="flex flex-col gap-2 overflow-auto flex-grow">
			{#snippet categorytitle(name: string)}
				<span class="text-3xl font-afacad-flux font-bold" id={name.toLowerCase()}>{name}</span>
			{/snippet}

			{@render categorytitle("Theme")}
			<Theme />
			{@render categorytitle("Player")}
			<PlayerSettings />
			{@render categorytitle("Player keybinds")}
			<PlayerKeybinds />
		</div>
	</div>
{/if}
