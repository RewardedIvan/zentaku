<script lang="ts">
	import { easeEmphasizedAccel, easeEmphasizedDecel, Menu, MenuItem } from "m3-svelte";
	import { createFloatingActions } from "svelte-floating-ui";
	import type { Snippet } from "svelte";
	import { offset, shift, flip } from "@floating-ui/dom";
	import { slide } from "svelte/transition";

	interface Props {
		children: Snippet<[]>;
		menu: Snippet<[]>;
		open: boolean;
	}

	let { children, menu, open = $bindable() }: Props = $props();

	let child: HTMLElement | null = $state(null);
	let menue: HTMLElement | null = $state(null);

	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: "absolute",
		placement: "top",
		middleware: [offset(6), flip(), shift()],
	});
</script>

<div class="flex" bind:this={child} use:floatingRef>
	{@render children()}
</div>

{#if open}
	<div
		class="w-max absolute"
		style="left: 0; top: 0;"
		aria-haspopup="menu"
		in:slide={{ duration: 200, easing: easeEmphasizedDecel, axis: "y" }}
		out:slide={{ duration: 200, easing: easeEmphasizedAccel, axis: "y" }}
		bind:this={menue}
		use:floatingContent
	>
		<Menu>
			{@render menu()}
		</Menu>
	</div>
{/if}
