<script lang="ts">
	import { createFloatingActions } from "svelte-floating-ui";
	import { type Placement, offset, shift, flip } from "@floating-ui/dom";
	import { slide } from "svelte/transition";
	import { easeEmphasizedAccel, easeEmphasizedDecel } from "m3-svelte";

	interface Props {
		class?: string;
		gap?: boolean;
		thumb?: "always" | "hover" | "dragging" | "none";
		heightChange?: boolean;
		tooltip?: "always" | "hover" | "dragging" | "dragging-or-hover" | "none";
		tooltipPlacement?: Placement;
		tooltipFormat?: (value: number) => string;
		scrollImpact?: number;

		value: number;
		min: number;
		max: number;
	}

	let {
		class: className,
		gap = false,
		thumb = "always",
		heightChange = false,
		value = $bindable(),
		tooltip = "hover",
		tooltipPlacement = "top",
		tooltipFormat = value => `${value.toFixed(1)}`,

		min,
		max,

		scrollImpact = max / 10,
	}: Props = $props();

	let dragging = $state(false);
	let hovering = $state(false);
	let track: HTMLElement | null = $state(null);

	function move(x: number) {
		if (!track) return;

		let rect = track.getBoundingClientRect();
		// bounds check
		if (x > rect.left || x < rect.right) {
			value = Math.max(Math.min(((x - rect.left) / rect.width) * (max - min) + min, max), min);
		}
	}

	function handleMove(e: MouseEvent) {
		if (!dragging) return;
		move(e.x);
	}

	function click(e: MouseEvent) {
		dragging = true;
		move(e.x);
	}

	function onScroll(e: WheelEvent) {
		console.log(e.deltaY, scrollImpact);
		if (scrollImpact === 0) return;

		value = Math.max(Math.min(value + scrollImpact * Math.sign(e.deltaY), max), min);
		e.preventDefault();
	}

	let scaleStyle = $derived.by(() => {
		switch (thumb) {
			case "always":
				return "scale-100";
			case "hover":
				return "group-hover:scale-100 data-[dragging=true]:scale-100 scale-0";
			case "dragging":
				return dragging ? "scale-100" : "scale-0";
			case "none":
				return "scale-0";
			default:
				return "scale-0";
		}
	});

	let tooltipShown = $derived.by(() => {
		switch (tooltip) {
			case "always":
				return true;
			case "dragging":
				return dragging;
			case "hover":
				return hovering;
			case "dragging-or-hover":
				return dragging || hovering;
			case "none":
				return false;
			default:
				return false;
		}
	});

	let gapStyle = $derived(gap ? "gap-1" : "");
	let heightStyle = $derived(
		heightChange ? "group-hover:h-1 data-[dragging=true]:h-1 h-0.5" : "h-1",
	);

	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: "absolute",
		placement: tooltipPlacement,
		middleware: [offset(6), flip(), shift()],
	});
</script>

<svelte:body onmousemove={handleMove} onmouseup={() => (dragging = false)} />

<button
	class="flex flex-row bg-secondary-container relative group focus:outline-none {gapStyle} {className}"
	draggable={false}
	ondragstart={e => e.preventDefault()}
	onpointerdown={click}
	onpointerenter={() => (hovering = true)}
	onpointerleave={() => (hovering = false)}
	onwheel={onScroll}
	bind:this={track}
	aria-label="Slider"
>
	<div
		class="absolute top-1/2 size-4 bg-primary rounded-full -translate-y-1/2 -translate-x-1/2 transition-transform ease-emphasized-accel duration-75 group-active:scale-105 group-active:bg-primary {scaleStyle}"
		style:left={`${((value + min) / max) * 100}%`}
		data-dragging={dragging}
		use:floatingRef
	></div>

	{#if tooltipShown}
		<div
			class="w-max absolute bg-inverse-surface text-inverse-on-surface p-2 rounded-xl z-[999]"
			style="left: 0; top: 0;"
			aria-haspopup="menu"
			in:slide={{ duration: 200, easing: easeEmphasizedDecel, axis: "y" }}
			out:slide={{ duration: 20, easing: easeEmphasizedAccel, axis: "y" }}
			use:floatingContent
		>
			<span class="text-center">{tooltipFormat(value)}</span>
		</div>
	{/if}

	<div
		class="bg-primary pointer-events-none rounded-full {heightStyle}"
		style:width={`${((value + min) / max) * 100}%`}
		data-dragging={dragging}
	></div>
	<div
		class="bg-secondary-container pointer-events-none rounded-full {heightStyle}"
		style:width={`${100 - ((value + min) / max) * 100}%`}
		data-dragging={dragging}
	></div>
</button>
