<script lang="ts">
	import { Card, easeEmphasizedAccel, easeEmphasizedDecel, Menu, MenuItem } from "m3-svelte";
	import { createFloatingActions } from "svelte-floating-ui";
	import type { Snippet } from "svelte";
	import { offset, shift, flip, type Placement } from "@floating-ui/dom";
	import { slide } from "svelte/transition";

	interface Props {
		children: Snippet<[]>;
		tooltip: Snippet<[]>;
		placement?: Placement;
		cardType?: "filled" | "outlined" | "elevated";
		class?: string;
		[key: string]: any;
	}

	let {
		children,
		tooltip,
		placement = "top",
		cardType = "outlined",
		class: className,
		...rest
	}: Props = $props();

	let child: HTMLElement | null = $state(null);
	let tooltipe: HTMLElement | null = $state(null);
	let show = $state(false);

	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: "absolute",
		placement: placement,
		middleware: [offset(6), flip(), shift()],
	});
</script>

<div
	class="flex {className}"
	bind:this={child}
	use:floatingRef
	onpointermove={() => (show = true)}
	onpointerleave={() => (show = false)}
	{...rest}
>
	{@render children()}
</div>

{#if show}
	<div
		class="w-max absolute bg-inverse-surface text-inverse-on-surface p-2 rounded-xl"
		style="left: 0; top: 0;"
		aria-haspopup="menu"
		in:slide={{ duration: 200, easing: easeEmphasizedDecel, axis: "y" }}
		out:slide={{ duration: 200, easing: easeEmphasizedAccel, axis: "y" }}
		bind:this={tooltipe}
		use:floatingContent
	>
		{@render tooltip()}
	</div>
{/if}
