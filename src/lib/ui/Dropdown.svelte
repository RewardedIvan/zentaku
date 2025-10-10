<script lang="ts" generics="T">
	import type { Placement } from "@floating-ui/core";
	import Menu from "./Menu.svelte";
	import { Button, MenuItem, TextField } from "m3-svelte";
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

	let open = $state(false);
	let error = $derived.by(() => {
		return (
			options.find(e => {
				if (typeof e == "object" && e != null && "value" in e) {
					return e.value == value;
				} else {
					return e == value;
				}
			}) == undefined
		);
	});

	let val: any = $state(value);

	$effect(() => {
		value = val;
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
