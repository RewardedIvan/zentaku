<script lang="ts">
	import { easeEmphasizedAccel, easeEmphasizedDecel, Menu } from "m3-svelte";
	import { createFloatingActions } from "svelte-floating-ui";
	import { type Snippet } from "svelte";
	import { offset, shift, flip, type Placement } from "@floating-ui/dom";
	import { slide } from "svelte/transition";

	interface Props {
		children: Snippet<[]>;
		menu: Snippet<[]>;
		placement?: Placement;
		open: boolean;
	}

	let { children, menu, placement = "bottom", open = $bindable() }: Props = $props();

	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: "absolute",
		placement,
		middleware: [offset(6), flip(), shift()],
	});
</script>

<div class="flex" use:floatingRef>
	{@render children()}
</div>

{#if open}
	<div
		class="w-max absolute"
		style="left: 0; top: 0;"
		aria-haspopup="menu"
		in:slide={{ duration: 200, easing: easeEmphasizedDecel, axis: "y" }}
		out:slide={{ duration: 200, easing: easeEmphasizedAccel, axis: "y" }}
		use:floatingContent
	>
		<Menu>
			{@render menu()}
		</Menu>
	</div>
{/if}
