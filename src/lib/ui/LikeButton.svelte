<script lang="ts">
    import { Button, easeEmphasizedAccel, easeEmphasizedDecel } from "m3-svelte";
	import { type IconifyIcon } from "@iconify/types";
	import { fly, scale, slide } from "svelte/transition";

    import HeartIcon from "@ktibow/iconset-material-symbols/favorite";
    import HeartOutlinedIcon from "@ktibow/iconset-material-symbols/favorite-outline";
    import ThumbsUpIcon from "@ktibow/iconset-material-symbols/thumb-up-rounded";
    import ThumbsDownIcon from "@ktibow/iconset-material-symbols/thumb-down-rounded";

    interface Props {
        value: boolean;
        onClick: () => void;
        icon: "thumb" | "heart";
    }

    let { value = $bindable(), icon, onClick }: Props = $props();

    /*
            -- ascend --
            in:fly={{ delay: 150, y: 10 }}
            out:fly={{ duration: 300, y: -10 }}

            -- slot machine --
            in:fly={{ y: 40 }}
            out:fly={{ duration: 300, y: -40 }}

            -- slot machine but m3 --
            in:fly={{ delay: 300, y: 40, easing: easeEmphasizedDecel }}
            out:fly={{ duration: 300, y: -40, easing: easeEmphasizedAccel }}

            -- popin type --
            in:scale={{ start: 0.1 }}
            out:scale={{ duration: 300, start: 0.1 }}

            -- popin but m3 --
            in:scale={{ delay: 300, start: 0.4, easing: easeEmphasizedDecel }}
            out:scale={{ duration: 300, start: 0.4, easing: easeEmphasizedAccel }}

            -- fill lookin typa animation --
            in:scale={{ duration: 400, start: 0.1, easing: easeEmphasizedDecel }}
            out:scale={{ start: 0.1, easing: easeEmphasizedAccel }}

            -- fill lookin better --
            in:slide={{ axis: "y" }}
            out:slide={{ axis: "x" }}
    */

    function click() {
        value = !value;
        onClick();
    }
</script>

{#snippet AnimatedIcon(icon: IconifyIcon)}
    <svg
        class="absolute"
        width={icon.width} height={icon.height}
        viewBox="0 0 {icon.width} {icon.height}"
        in:fly={{ delay: 300, y: 40, easing: easeEmphasizedDecel }}
        out:fly={{ duration: 300, y: -40, easing: easeEmphasizedAccel }}
    >
        {@html icon.body}
    </svg>
{/snippet}

<Button type="text" iconType="full" on:click={click}>
    {#if icon == "thumb"}
        {#if value}
            {@render AnimatedIcon(ThumbsUpIcon)}
        {:else}
            {@render AnimatedIcon(ThumbsDownIcon)}
        {/if}
    {:else if icon == "heart"}
        {#if value}
            {@render AnimatedIcon(HeartIcon)}
        {:else}
            {@render AnimatedIcon(HeartOutlinedIcon)}
        {/if}
    {/if}
</Button>