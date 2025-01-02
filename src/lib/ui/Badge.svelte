<script lang="ts">
	import { createFloatingActions } from "svelte-floating-ui";
	import { type Snippet } from "svelte";
	import { offset, shift, flip, type Placement } from "@floating-ui/dom";

	interface Props {
		children: Snippet<[]>;
		badge: Snippet<[]>;
		placement?: Placement;
		class?: string;
		show?: boolean;
		color?: "error" | "primary" | "secondary" | "tertiary" | "surface";
		[key: string]: any;
	}

	let {
		children,
		badge,
		placement = "top-end",
		cardType = "outlined",
		color = "error",
		show = true,
		class: className,
		...rest
	}: Props = $props();

	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: "absolute",
		placement,
		middleware: [
			flip(),
			shift(),
			offset(({ rects }) => ({
				alignmentAxis: -rects.floating.width / 2,
				mainAxis: -rects.reference.height / 2,
			})),
		],
	});
</script>

<div class="flex {className}" use:floatingRef {...rest}>
	{@render children()}
</div>

{#if show}
	<div
		class="w-max absolute bg-{color} text-on-{color} p-1 rounded-full z-[999]"
		style="left: 0; top: 0;"
		use:floatingContent
	>
		{@render badge()}
	</div>
{/if}
