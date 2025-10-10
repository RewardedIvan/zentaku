<script lang="ts" generics="T">
	import type { Placement } from "@floating-ui/core";
	import { CurrentDropdown } from "$lib/stores/App";
	import Menu from "./Menu.svelte";
	import { Button, MenuItem, TextField } from "m3-svelte";
	import { get } from "svelte/store";
	import type { IconifyIcon } from "@iconify/types";

	import DownArrow from "@ktibow/iconset-material-symbols/arrow-drop-down";

	interface Descriptor<T> {
		text?: string;
		value: T;
		icon?: IconifyIcon;
	}

	interface Props<T> {
		type?: "button" | "textfield";
		label: string;
		placement?: Placement;
		closeOnClick?: boolean;
		options: (T | Descriptor<T>)[];
		value: T;
	}

	let {
		type = "textfield",
		label,
		placement = "bottom-end",
		closeOnClick = true,
		options,
		value = $bindable(),
	}: Props<T> = $props();

	const id = $props.id();
	let open = $state(false);
	let error = $derived.by(() => {
		return options.every(e => {
			if (typeof e == "object" && e != null && "value" in e) {
				return e.value != value;
			} else {
				return e != value;
			}
		});
	});

	let val: any = $state(value);

	$effect(() => {
		value = val;
	});

	$effect(() => {
		if (open) {
			CurrentDropdown.set(id);
		} else if (get(CurrentDropdown) == id) {
			CurrentDropdown.set("");
		}
	});

	CurrentDropdown.subscribe(v => {
		if (v != id) {
			open = false;
		}
	});

	function changeValue(o: T | Descriptor<T>) {
		if (typeof o == "object" && o != null && "value" in o) {
			val = o.value;
		} else {
			val = o;
		}

		if (closeOnClick) {
			open = false;
		}
	}
</script>

<Menu bind:open {placement}>
	{#if type == "button"}
		<Button variant="filled" onclick={() => (open = !open)}>{label}</Button>
	{:else if type == "textfield"}
		<TextField
			{label}
			trailing={{ icon: DownArrow, onclick: () => (open = !open) }}
			bind:value={val}
			autocomplete="off"
			{error}
		/>
	{/if}

	{#snippet menu()}
		{#each options as o}
			{#if typeof o == "object" && o != null && "value" in o}
				<MenuItem icon={o.icon} onclick={() => changeValue(o.value)}>{o.text}</MenuItem>
			{:else}
				<MenuItem onclick={() => changeValue(o)}>{o}</MenuItem>
			{/if}
		{/each}
	{/snippet}
</Menu>
