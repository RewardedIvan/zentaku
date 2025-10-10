<script lang="ts">
	import { easeEmphasizedAccel, easeEmphasizedDecel } from "m3-svelte";
	import { createFloatingActions } from "svelte-floating-ui";
	import { type Snippet } from "svelte";
	import { offset, shift, autoPlacement, type Placement, inline } from "@floating-ui/dom";
	import { slide } from "svelte/transition";

	interface Props {
		children: Snippet<[]>;
		tooltip: Snippet<[]>;
		placement?: Placement;
		allowedPlacements?: Placement[];
		cardType?: "filled" | "outlined" | "elevated" | "none";
		class?: string;
		tooltipPointerEvents?: boolean;
		[key: string]: any;
	}

	let {
		children,
		tooltip,
		placement = "top",
		allowedPlacements = ["bottom", "top"],
		cardType = "outlined",
		class: className,
		tooltipPointerEvents = false,
		...rest
	}: Props = $props();

	let show = $state(false);

	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: "absolute",
		placement,
		middleware: [autoPlacement({ allowedPlacements }), offset(6), shift(), inline()],
	});
</script>

<div
	class="flex {className}"
	use:floatingRef
	onpointerenter={() => (show = true)}
	onpointerleave={() => (show = false)}
	{...rest}
>
	{@render children()}
</div>

{#if show}
	<div
		class="w-max absolute {cardType != 'none'
			? 'bg-inverse-surface text-inverse-on-surface p-2 rounded-xl'
			: ''} z-[999]"
		style="left: 0; top: 0; pointer-events: {tooltipPointerEvents ? 'auto' : 'none'};"
		aria-haspopup="menu"
		in:slide={{ duration: 200, easing: easeEmphasizedDecel, axis: "y" }}
		out:slide={{ duration: 20, easing: easeEmphasizedAccel, axis: "y" }}
		use:floatingContent
	>
		{@render tooltip()}
	</div>
{/if}
