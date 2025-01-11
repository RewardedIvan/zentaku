<script lang="ts">
	import type { Snippet } from "svelte";
	import { Layer } from "m3-svelte";
	import type { Placement } from "@floating-ui/core";

	import Tooltip from "./Tooltip.svelte";

	interface Props {
		content: Snippet<[boolean]>;
		shown?: boolean;
		tooltip?: Snippet<[]>;
		disableTooltip?: boolean;
		tooltipPlacement?: Placement;
		class?: string;
		[key: string]: any;
	}

	let {
		content,
		shown: shownProp = $bindable(),
		tooltip: tooltipProp,
		tooltipPlacement = "top",
		disableTooltip = false,
		class: className,
		...rest
	}: Props = $props();

	let shown = $state(shownProp ?? false);

	$effect(() => {
		shown = shownProp ?? false;
	});
</script>

{#snippet main()}
	<button
		class="relative bg-surface-container-lowest"
		class:bg-surface-container-high={shown}
		class:bg-surface-container-lowest={!shown}
		onclick={() => (shown = !shown)}
		{...rest}
	>
		{@render content(shown)}

		<Layer />
	</button>
{/snippet}

{#if disableTooltip}
	{@render main()}
{:else}
	{#snippet defaultTooltip()}
		<span>Spoiler</span>
	{/snippet}

	<Tooltip
		class="w-fit"
		children={main}
		tooltip={tooltipProp ?? defaultTooltip}
		placement={tooltipPlacement}
	/>
{/if}
