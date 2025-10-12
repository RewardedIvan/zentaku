<script lang="ts">
	import { Settings } from "$lib/stores/settings";
	import {
		Button,
		Chip,
		Divider,
		easeEmphasizedAccel,
		easeEmphasizedDecel,
		Icon,
		ListItem,
		TextField,
	} from "m3-svelte";
	import { slide } from "svelte/transition";
	import Dropdown from "$lib/ui/Dropdown.svelte";

	import KeyboardIcon from "@ktibow/iconset-material-symbols/keyboard";
	import XIcon from "@ktibow/iconset-material-symbols/close";
	import AddIcon from "@ktibow/iconset-material-symbols/add";
	import DeleteIcon from "@ktibow/iconset-material-symbols/delete";
	import EditIcon from "@ktibow/iconset-material-symbols/edit";

	let capturingKey = $state(-1);
	let editingKeybind = $state(-1);

	$effect(() => {
		if (editingKeybind != capturingKey) {
			capturingKey = -1;
		}
	});

	function onKeyDown(e: KeyboardEvent) {
		if (capturingKey < 0) return;
		if (e.key == "Escape") {
			capturingKey = -1;
			return;
		}

		$Settings.playerKeybinds[capturingKey].keybind = e.key;
		$Settings.playerKeybinds[capturingKey].whenAlt = e.altKey;
		$Settings.playerKeybinds[capturingKey].whenShift = e.shiftKey;
		$Settings.playerKeybinds[capturingKey].whenCtrl = e.ctrlKey;

		e.preventDefault();
	}
</script>

<svelte:window onkeydown={onKeyDown} />

<div class="flex flex-col">
	<a
		href="https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values"
		target="_blank"
		class="text-blue-500 underline"
	>
		List of available keys
	</a>

	<div class="flex flex-col">
		{#each $Settings.playerKeybinds as _, i}
			<div
				class="flex flex-row items-center justify-between h-14 p-2"
				in:slide={{ duration: 300, easing: easeEmphasizedDecel }}
				out:slide={{ duration: 200, easing: easeEmphasizedAccel }}
			>
				<div class="flex flex-row items-center gap-1">
					{#snippet chip(name: string, key: "whenAlt" | "whenShift" | "whenCtrl")}
						{#if (editingKeybind != i && $Settings.playerKeybinds[i][key]) || editingKeybind == i}
							<Chip
								variant="input"
								disabled={editingKeybind != i}
								selected={$Settings.playerKeybinds[i][key]}
								onclick={() =>
									($Settings.playerKeybinds[i][key] = !$Settings.playerKeybinds[i][key])}
							>
								{name}
							</Chip>
						{/if}
					{/snippet}

					{#if editingKeybind != i}
						{#if $Settings.playerKeybinds[i].whenShift}
							{@render chip("Shift", "whenShift")}
						{/if}
						{#if $Settings.playerKeybinds[i].whenCtrl}
							{@render chip("Ctrl", "whenCtrl")}
						{/if}
						{#if $Settings.playerKeybinds[i].whenAlt}
							{@render chip("Alt", "whenAlt")}
						{/if}
					{:else}
						{@render chip("Shift", "whenShift")}
						{@render chip("Ctrl", "whenCtrl")}
						{@render chip("Alt", "whenAlt")}
					{/if}

					{#if editingKeybind != i}
						<Chip disabled={true} selected variant="input" onclick={() => {}}>
							{$Settings.playerKeybinds[i].keybind.replace(/^$/, "INVALID").replace(/^ $/, "Space")}
						</Chip>
					{:else}
						<TextField
							bind:value={$Settings.playerKeybinds[i].keybind}
							label="Keybind"
							trailing={{
								icon: capturingKey == i ? XIcon : KeyboardIcon,
								onclick: () => (capturingKey = capturingKey == i ? -1 : i),
							}}
						/>
						<Dropdown
							bind:value={$Settings.playerKeybinds[i].action}
							type="textfield"
							label="Action"
							options={[
								{ value: "time", text: "Forward/Rewind" },
								{ value: "volume", text: "Volume up/down" },
								{ value: "play", text: "Play" },
								{ value: "pause", text: "Pause" },
								{ value: "togglepause", text: "Toggle pause" },
								{ value: "fullscreen", text: "Fullscreen" },
							]}
						/>
						<TextField
							bind:value={$Settings.playerKeybinds[i].units as any}
							label="Units"
							type="number"
						/>
					{/if}
				</div>

				<div class="flex flex-row items-center">
					{#if editingKeybind == i}
						<TextField bind:value={$Settings.playerKeybinds[i].description} label="Description" />
					{:else}
						<span>{$Settings.playerKeybinds[i].description}</span>
					{/if}

					<div class="w-2"></div>

					<Button
						variant="text"
						iconType="full"
						onclick={() => (editingKeybind = editingKeybind == i ? -1 : i)}
					>
						<Icon icon={EditIcon} />
					</Button>
					<Button
						variant="text"
						iconType="full"
						onclick={() =>
							($Settings.playerKeybinds = $Settings.playerKeybinds.filter((_, t) => t != i))}
					>
						<Icon icon={DeleteIcon} />
					</Button>
				</div>
			</div>
			<Divider />
		{/each}
		<ListItem
			onclick={() =>
				($Settings.playerKeybinds = [
					...$Settings.playerKeybinds,
					{
						keybind: "",
						action: "time",
						description: "new keybind",
					},
				])}
			headline="Add keybind"
		>
			{#snippet leading()}
				<Icon icon={AddIcon} />
			{/snippet}
		</ListItem>
	</div>
</div>
