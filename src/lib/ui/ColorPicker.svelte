<script lang="ts">
	import type { Snippet } from "svelte";
	import Menu from "./Menu.svelte";
	import { easeEmphasizedAccel, easeEmphasizedDecel, Tabs } from "m3-svelte";
	import { slide } from "svelte/transition";
	import {
		extractArgb,
		HSVtoRGB,
		RGBtoHSV,
		withComponentValue,
		type RGBAComponent,
	} from "$lib/utils/Colors";

	interface Props {
		argb: number;
		preview?: Snippet<[string, () => void]>;
		onArgbChange: (v: number) => void;
	}

	let { argb, preview, onArgbChange }: Props = $props();

	let open = $state(false);

	let hue = $state(0);
	let sat = $state(0);
	let val = $state(0);

	$effect(() => {
		const extracted = extractArgb(argb);
		const hsv = RGBtoHSV(extracted.r, extracted.g, extracted.b);
		hue = hsv.h * 360;
		sat = hsv.s * 100;
		val = hsv.v * 100;
	});

	function updateFromHsv() {
		const rgb = HSVtoRGB(hue / 360, sat / 100, val / 100);
		onArgbChange((rgb.r << 16) | (rgb.g << 8) | rgb.b | (argb & 0xff000000));
	}

	function onHueMouseMove(e: MouseEvent) {
		if (e.buttons != 1) return;
		if (!e.target) return;
		e.preventDefault();

		const target = e.target as HTMLButtonElement;
		const rect = target.getBoundingClientRect();
		const x = e.clientX - rect.left - target.clientWidth / 2;
		const y = e.clientY - rect.top - target.clientHeight / 2;
		const radius = Math.sqrt(x * x + y * y);
		const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
		hue = (angle + 360) % 360;
		sat = Math.min(100, (radius / (target.clientWidth / 2)) * 100);

		updateFromHsv();
	}

	function onValueMouseMove(e: MouseEvent) {
		if (e.buttons != 1 || e.target != e.currentTarget) return;
		const target = e.target as HTMLButtonElement;

		val = Math.round(100 - (e.offsetY / target.clientHeight) * 100);
		updateFromHsv();
	}

	function onMoveComponent(e: MouseEvent, component: RGBAComponent) {
		if (e.buttons != 1 || e.target != e.currentTarget) return;
		e.preventDefault();
		const target = e.target as HTMLButtonElement;
		const normalized = (e.offsetX / target.clientWidth) * 255;

		onArgbChange(withComponentValue(argb, component, normalized));
	}

	let tab = $state("huecircle");
	let hex = $derived("#" + argb.toString(16).padStart(8, "0"));
</script>

<Menu bind:open>
	{@render preview?.(hex, () => (open = !open))}

	{#snippet menu()}
		<Tabs
			items={[
				{ value: "huecircle", name: "Hue Circle" },
				{ value: "rgba", name: "RGBA" },
			]}
			extraWrapperOptions={{ style: "display: flex; --items: 2; margin-top: -0.5rem;" }}
			bind:tab
		/>

		{#if tab == "huecircle"}
			{@const rgb = HSVtoRGB(hue / 360, sat / 100, 1)}

			<div
				class="flex flex-row gap-2 px-2 pt-2"
				in:slide={{ duration: 300, easing: easeEmphasizedDecel, delay: 300 }}
				out:slide={{ duration: 300, easing: easeEmphasizedAccel }}
			>
				<button
					class="cursor-crosshair size-48 relative rounded-full"
					aria-label="hue"
					onmousemove={onHueMouseMove}
					style="background: radial-gradient(white 0%, transparent 50%), conic-gradient(in hsl longer hue, red, red);"
				>
					<svg
						viewBox="0 0 64 64"
						class="absolute size-5 -translate-x-1/2 translate-y-1/2 pointer-events-none"
						style:left={50 + 50 * (sat / 100) * Math.sin((hue * Math.PI) / 180) + "%"}
						style:bottom={50 + 50 * (sat / 100) * Math.cos((hue * Math.PI) / 180) + "%"}
					>
						<rect x="32" y="0" width="4" height="64" fill="black"></rect>
						<rect x="0" y="32" width="64" height="4" fill="black"></rect>
					</svg>
				</button>

				<button
					class="h-48 w-4 relative cursor-crosshair"
					style="background: linear-gradient(to bottom, rgb({rgb.r}, {rgb.g}, {rgb.b}) 0%, #000 100%)"
					onmousemove={onValueMouseMove}
					aria-label="value circle"
				>
					<div
						class="absolute h-1 rounded outline outline-2 outline-offset-1 outline-primary w-full pointer-events-none"
						style:bottom="{val}%"
					></div>
				</button>
			</div>
		{:else if tab == "rgba"}
			<div
				class="flex flex-col gap-2 px-2 pt-2"
				in:slide={{ duration: 300, easing: easeEmphasizedDecel, delay: 300 }}
				out:slide={{ duration: 300, easing: easeEmphasizedAccel }}
			>
				{#snippet component(comp: RGBAComponent)}
					{@const start = extractArgb(withComponentValue(argb, comp, 0))}
					{@const end = extractArgb(withComponentValue(argb, comp, 255))}

					<button
						class="h-4 w-full relative cursor-crosshair"
						style="background: linear-gradient(to right, rgba({start.r}, {start.g}, {start.b}, {start.a}) 0%, rgba({end.r}, {end.g}, {end.b}, {end.a}) 100%)"
						onmousemove={e => onMoveComponent(e, comp)}
						aria-label="{comp} slider"
					>
						<div
							class="absolute w-1 rounded outline outline-2 outline-offset-1 outline-on-surface h-full top-0"
							style:left="{(extractArgb(argb)[comp] / 255) * 100}%"
						></div>
					</button>
				{/snippet}

				{@render component("r")}
				{@render component("g")}
				{@render component("b")}
				{@render component("a")}
			</div>
		{/if}
	{/snippet}
</Menu>
