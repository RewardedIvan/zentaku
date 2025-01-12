<script lang="ts">
	import { Spring } from "svelte/motion";
	import { createFloatingActions } from "svelte-floating-ui";
	import { type Placement, offset, shift, flip } from "@floating-ui/dom";
	import { slide } from "svelte/transition";
	import { easeEmphasizedAccel, easeEmphasizedDecel } from "m3-svelte";

	interface Props {
		max: number;
		min: number;
		bottom: number;
		upper: number;
		step?: number | "any";
		tooltip?: "always" | "hover" | "none";
		tooltipPlacement?: Placement;
		tooltipFormat?: (value: number) => string;
	}

	let {
		max,
		min,
		bottom = $bindable(),
		upper = $bindable(),
		step,
		tooltip = "hover",
		tooltipPlacement = "top",
		tooltipFormat = value => `${value.toFixed(0)}`,
	}: Props = $props();

	const bottomSpring = new Spring(bottom, { stiffness: 0.3, damping: 1 });
	const upperSpring = new Spring(upper, { stiffness: 0.3, damping: 1 });

	let hovering = $state(false);
	const [floatingRefBottom, floatingContentBottom, updateBottom] = createFloatingActions({
		strategy: "absolute",
		placement: tooltipPlacement,
		middleware: [offset(6), flip(), shift()],
	});
	const [floatingRefUpper, floatingContentUpper, updateUpper] = createFloatingActions({
		strategy: "absolute",
		placement: tooltipPlacement,
		middleware: [offset(6), flip(), shift()],
	});

	let tooltipShown = $derived.by(() => {
		switch (tooltip) {
			case "always":
				return true;
			case "hover":
				return hovering;
			default:
				return false;
		}
	});

	let bottomSpringed = {
		get value() {
			return bottomSpring.current;
		},
		set value(v) {
			bottom = Math.min(v, upper - 1);
			bottomSpring.set(bottom);
			updateBottom();
		},
	};

	let upperSpringed = {
		get value() {
			return upperSpring.current;
		},
		set value(v) {
			upper = Math.max(v, bottom + 1);
			upperSpring.set(upper);
			updateUpper();
		},
	};
</script>

<div
	class="relative w-full"
	onpointerenter={() => (hovering = true)}
	onpointerleave={() => (hovering = false)}
>
	{#if tooltipShown}
		<div
			class="w-max absolute bg-inverse-surface text-inverse-on-surface p-2 rounded-xl z-[999]"
			style="left: 0; top: 0;"
			aria-haspopup="menu"
			in:slide={{ duration: 200, easing: easeEmphasizedDecel, axis: "y" }}
			out:slide={{ duration: 20, easing: easeEmphasizedAccel, axis: "y" }}
			use:floatingContentBottom
		>
			<span class="text-center">{tooltipFormat(bottom)}</span>
		</div>

		<div
			class="w-max absolute bg-inverse-surface text-inverse-on-surface p-2 rounded-xl z-[999]"
			style="left: 0; top: 0;"
			aria-haspopup="menu"
			in:slide={{ duration: 200, easing: easeEmphasizedDecel, axis: "y" }}
			out:slide={{ duration: 20, easing: easeEmphasizedAccel, axis: "y" }}
			use:floatingContentUpper
		>
			<span class="text-center">{tooltipFormat(upper)}</span>
		</div>

		<!-- thumb trackers -->
		<div
			class="absolute h-11 w-1 top-0"
			style="
                left: {(bottomSpringed.value / max) * 100};
                right: {100 - (bottomSpringed.value / max) * 100}%;
                transform: translate(2px, -50%);
            "
			use:floatingRefBottom
		></div>
		<div
			class="absolute h-11 w-1 top-0"
			style="
                left: {(upperSpringed.value / max) * 100};
                right: {100 - (upperSpringed.value / max) * 100}%;
                transform: translate(2px, -50%);
            "
			use:floatingRefUpper
		></div>
	{/if}

	<input
		type="range"
		{min}
		{max}
		{step}
		bind:value={bottomSpringed.value}
		class="absolute w-full appearance-none pointer-events-none h-0 z-10"
		ondrag={e => e.preventDefault()}
	/>

	<input
		type="range"
		{min}
		{max}
		{step}
		bind:value={upperSpringed.value}
		class="absolute w-full appearance-none pointer-events-none h-0 z-20"
		ondrag={e => e.preventDefault()}
	/>

	<div
		class="absolute top-1/2 transform -translate-y-1/2 h-4 rounded-r-slider-track-in rounded-l-slider-track-out bg-secondary-container"
		style="left: 0; right: calc({100 - (bottomSpring.current / max) * 100}% + 0.375rem);"
		ondrag={e => e.preventDefault()}
		role="slider"
		aria-valuenow={bottom}
		tabindex="0"
	></div>
	<div
		class="absolute top-1/2 transform -translate-y-1/2 h-4 rounded-slider-track-in bg-primary"
		style="
            left: calc({(bottomSpring.current / max) * 100}% + 0.375rem);
            right: calc({100 - (upperSpring.current / max) * 100}% + 0.375rem);
        "
		ondrag={e => e.preventDefault()}
		role="slider"
		aria-valuenow={0}
		tabindex="0"
	></div>
	<div
		class="absolute top-1/2 transform -translate-y-1/2 h-4 rounded-r-slider-track-out rounded-l-slider-track-in bg-secondary-container"
		style="left: calc({(upperSpring.current / max) * 100}% + 0.375rem); right: 0;"
		ondrag={e => e.preventDefault()}
		role="slider"
		aria-valuenow={upper}
		tabindex="0"
	></div>
</div>

<style lang="postcss">
	:global(input[type="range"]) {
		appearance: none;
	}

	input[type="range"]::-webkit-slider-thumb {
		pointer-events: all;
		width: 0.25rem;
		height: 2.75rem;
		background: theme(colors.primary);
		border-radius: 0.4rem;
		box-shadow: var(--m3-util-elevation-1) var(--color-shadow);
		border: none;
		cursor: pointer;
		-webkit-appearance: none;
	}

	input[type="range"]::-moz-range-thumb {
		pointer-events: all;
		width: 0.25rem;
		height: 2.75rem;
		background: theme(colors.primary);
		border-radius: 0.4rem;
		box-shadow: var(--m3-util-elevation-1) var(--color-shadow);
		border: none;
		cursor: pointer;
	}

	input[type="range"]::-ms-thumb {
		pointer-events: all;
		width: 0.25rem;
		height: 2.75rem;
		background: theme(colors.primary);
		border-radius: 0.4rem;
		box-shadow: var(--m3-util-elevation-1) var(--color-shadow);
		border: none;
		cursor: pointer;
	}

	/* Active state */
	input[type="range"]:active::-webkit-slider-thumb {
		background: theme(colors.primary);
		width: 0.125rem;
	}

	input[type="range"]:active::-moz-range-thumb {
		background: theme(colors.primary);
		width: 0.125rem;
	}

	input[type="range"]:active::-ms-thumb {
		background: theme(colors.primary);
		width: 0.125rem;
	}
</style>
