<script lang="ts">
	import type { Placement } from "@floating-ui/core";
	import Menu from "./Menu.svelte";
	import { Button, MenuItem, TextField } from "m3-svelte";
	import type { IconifyIcon } from "@iconify/types";

    import DownArrow from "@ktibow/iconset-material-symbols/arrow-drop-down";

    interface Props {
        type?: "button" | "textfield";
        name: string;
        placement?: Placement;
        closeOnClick?: boolean;
        options: string[] | { value: string, icon: IconifyIcon }[];
        value: string;
    }

    let {
        type = "textfield",
        name,
        placement = "bottom-end",
        closeOnClick = true,
        options,
        value = $bindable(),
    }: Props = $props();

    let open = $state(false);
    let error = $derived.by(() => {
        return options.find(e => {
            if (typeof e == "string") {
                return e == value;
            } else {
                return e.value == value;
            }
        }) == undefined;
    });
    
    function changeValue(o: string | { value: string, icon: IconifyIcon }) {
        if (typeof o == "string") {
            value = o;
        } else {
            value = o.value;
        }

        if (closeOnClick) {
            open = false;
        }
    }
</script>

<Menu bind:open {placement}>
    {#if type == "button"}
        <Button type="filled" on:click={() => open = !open}>{name}</Button>
    {:else if type == "textfield"}
        <TextField
            {name}
            trailingIcon={DownArrow}
            on:trailingClick={() => open = !open}
            bind:value
            {error}
        />
    {/if}

    {#snippet menu()}
        {#each options as o}
            {#if typeof o == "string"}
                <MenuItem on:click={() => changeValue(o)}>{o}</MenuItem>
            {:else}
                <MenuItem icon={o.icon} on:click={() => changeValue(o)}>{o.value}</MenuItem>
            {/if}
        {/each}
    {/snippet}
</Menu>