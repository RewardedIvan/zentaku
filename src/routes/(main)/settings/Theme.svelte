<script lang="ts">
	import { Button, Chip, Icon, pairs, Slider, Switch } from "m3-svelte";
	import {
		DynamicScheme,
		Hct,
		Variant,
		hexFromArgb,
	} from "@ktibow/material-color-utilities-nightly";
	import { Settings } from "$lib/stores/Settings";
	import Tooltip from "$lib/ui/Tooltip.svelte";
	import ColorPicker from "$lib/ui/ColorPicker.svelte";

	import CopyIcon from "@ktibow/iconset-material-symbols/content-copy";
	import PickIcon from "@ktibow/iconset-material-symbols/colorize";

	type Color =
		| "primary"
		| "onPrimary"
		| "primaryContainer"
		| "onPrimaryContainer"
		| "inversePrimary"
		| "secondary"
		| "onSecondary"
		| "secondaryContainer"
		| "onSecondaryContainer"
		| "tertiary"
		| "onTertiary"
		| "tertiaryContainer"
		| "onTertiaryContainer"
		| "error"
		| "onError"
		| "errorContainer"
		| "onErrorContainer"
		| "background"
		| "onBackground"
		| "surface"
		| "onSurface"
		| "surfaceVariant"
		| "onSurfaceVariant"
		| "inverseSurface"
		| "inverseOnSurface"
		| "outline"
		| "outlineVariant"
		| "shadow"
		| "scrim"
		| "surfaceDim"
		| "surfaceBright"
		| "surfaceContainerLowest"
		| "surfaceContainerLow"
		| "surfaceContainer"
		| "surfaceContainerHigh"
		| "surfaceContainerHighest"
		| "surfaceTint";

	const commonArgs = $derived({
		sourceColorHct: Hct.fromInt($Settings.theme.sourceColor),
		contrastLevel: $Settings.theme.contrast,
		variant: $Settings.theme.variant,
		specVersion: "2025" as any,
	});
	let schemes = $derived({
		light: new DynamicScheme({ ...commonArgs, isDark: false }),
		dark: new DynamicScheme({ ...commonArgs, isDark: true }),
	});
	let isDark = $state(window.matchMedia("(prefers-color-scheme: dark)").matches);
	window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
		isDark = e.matches;
	});
	let currentScheme = $derived(isDark ? schemes.dark : schemes.light);
</script>

<div class="p-4 flex flex-col gap-4">
	<label for={null} class="flex flex-row items-center gap-2">
		<ColorPicker
			argb={$Settings.theme.sourceColor}
			onArgbChange={v => ($Settings.theme.sourceColor = v)}
		>
			{#snippet preview(hex: string, toggleMenu: () => void)}
				<div class="flex flex-row items-center gap-2">
					<Button variant="filled" iconType="full" onclick={toggleMenu}>
						<Icon icon={PickIcon} />
					</Button>
					<span>Pick source color</span>
				</div>
			{/snippet}
		</ColorPicker>
	</label>

	<label for={undefined} class="w-fit flex flex-row items-center gap-2">
		<Slider
			min={-1}
			max={1}
			step={0.05}
			format={n => n.toString()}
			bind:value={$Settings.theme.contrast}
		/>
	</label>

	{#snippet algobutton(name: string, key: Variant)}
		<Chip
			variant="assist"
			onclick={() => ($Settings.theme.variant = key)}
			selected={$Settings.theme.variant == key}
		>
			{name}
		</Chip>
	{/snippet}

	<div class="flex flex-row gap-2 flex-wrap">
		{@render algobutton("Tonal Spot", Variant.TONAL_SPOT)}
		{@render algobutton("Content", Variant.CONTENT)}
		{@render algobutton("Fidelity", Variant.FIDELITY)}
		{@render algobutton("Vibrant", Variant.VIBRANT)}
		{@render algobutton("Expressive", Variant.EXPRESSIVE)}
		{@render algobutton("Rainbow", Variant.RAINBOW)}
		{@render algobutton("Fruit salad", Variant.FRUIT_SALAD)}
		{@render algobutton("Neutral", Variant.NEUTRAL)}
		{@render algobutton("Monochrome", Variant.MONOCHROME)}
	</div>

	<div class="grid grid-rows-2 grid-cols-6 grid-flow-col-dense rounded-xl overflow-hidden">
		{#each pairs as [bg, fg]}
			{@const bgHex = hexFromArgb(bg.getArgb(currentScheme as any))}
			{@const fgHex = hexFromArgb(fg.getArgb(currentScheme as any))}

			<div class="h-40 p-4 flex flex-col gap-2" style:background={bgHex} style:color={fgHex}>
				<div class="flex flex-row justify-between flex-wrap">
					<span class="text-xl">{bg.name.replaceAll("_", " ")}</span>
					<span class="text-xl" style:background={fgHex} style:color={bgHex}>{bgHex}</span>
				</div>
				<div class="flex flex-row justify-between flex-wrap gap-1">
					<span>{fg.name.replaceAll("_", " ")}</span>
					<span style:background={fgHex} style:color={bgHex}>{fgHex}</span>
				</div>
			</div>
		{/each}
	</div>
</div>
