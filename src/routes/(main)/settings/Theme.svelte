<script lang="ts">
	import { Button, Chip, Icon, pairs, serializeScheme, Slider, Switch } from "m3-svelte";
	import {
		hexFromArgb,
		MaterialDynamicColors,
		Hct,
		type DynamicScheme,
		SchemeTonalSpot,
		SchemeContent,
		SchemeFidelity,
		SchemeVibrant,
		SchemeExpressive,
		SchemeNeutral,
		SchemeMonochrome,
	} from "@material/material-color-utilities";
	import { Settings } from "$lib/stores/Settings";
	import Tooltip from "$lib/ui/Tooltip.svelte";
	import ColorPicker from "$lib/ui/ColorPicker.svelte";

	import CopyIcon from "@ktibow/iconset-material-symbols/content-copy";
	import PickIcon from "@ktibow/iconset-material-symbols/colorize";

	const schemes = {
		tonal_spot: SchemeTonalSpot,
		content: SchemeContent,
		fidelity: SchemeFidelity,
		vibrant: SchemeVibrant,
		expressive: SchemeExpressive,
		neutral: SchemeNeutral,
		monochrome: SchemeMonochrome,
	};

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

	let scheme = $derived(schemes[$Settings.theme.algorithm]);
	let contrastFloat = $derived.by(() => {
		switch ($Settings.theme.contrast) {
			case 0:
				return -0.5;
			case 1:
				return 0;
			case 2:
				return 6 / 12;
			case 3:
				return 8 / 12;
			case 4:
				return 10 / 12;
			case 5:
				return 11 / 12;
			default:
				return 1;
		}
	});
	let schemeLight: DynamicScheme = $derived(
		new scheme(Hct.fromInt($Settings.theme.sourceColor), false, contrastFloat),
	);
	let schemeDark: DynamicScheme = $derived(
		new scheme(Hct.fromInt($Settings.theme.sourceColor), true, contrastFloat),
	);
	let isDark = $state(window.matchMedia("(prefers-color-scheme: dark)").matches);
	window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
		isDark = e.matches;
	});
	let currentScheme = $derived(isDark ? schemeDark : schemeLight);

	let debounceTimeout: number | undefined = $state(undefined);
	$effect(() => {
		$Settings.theme.contrast;
		$Settings.theme.algorithm;
		$Settings.theme.sourceColor;

		debounceTimeout = setTimeout(() => {
			$Settings.theme.serialized = {
				lightScheme: serializeScheme(schemeLight),
				darkScheme: serializeScheme(schemeDark),
			};
		}, 1000);

		return () => {
			clearTimeout(debounceTimeout);
		};
	});
</script>

<div class="p-4 flex flex-col gap-4">
	<label for={null} class="flex flex-row items-center gap-2">
		<ColorPicker
			argb={$Settings.theme.sourceColor}
			onArgbChange={v => ($Settings.theme.sourceColor = v)}
		>
			{#snippet preview(hex: string, toggleMenu: () => void)}
				<div class="flex flex-row items-center gap-2">
					<Button type="filled" iconType="full" on:click={toggleMenu}>
						<Icon icon={PickIcon} />
					</Button>
					<span>Pick source color</span>
				</div>
			{/snippet}
		</ColorPicker>
	</label>

	<label for={undefined} class="w-fit flex flex-row items-center gap-2">
		<Slider min={0} max={6} step={1} bind:value={$Settings.theme.contrast} />
		{$Settings.theme.contrast == 0
			? "low"
			: $Settings.theme.contrast == 1
				? "normal"
				: $Settings.theme.contrast == 2
					? "weird"
					: "extra"}
	</label>

	{#snippet algobutton(name: string, key: keyof typeof schemes)}
		<Chip
			type="assist"
			on:click={() => ($Settings.theme.algorithm = key)}
			selected={$Settings.theme.algorithm == key}
		>
			{name}
		</Chip>
	{/snippet}

	<div class="flex flex-row gap-2 overflow-x-auto">
		{@render algobutton("Tonal Spot", "tonal_spot")}
		{@render algobutton("Content", "content")}
		{@render algobutton("Fidelity", "fidelity")}
		{@render algobutton("Vibrant", "vibrant")}
		{@render algobutton("Expressive", "expressive")}
		{@render algobutton("Neutral", "neutral")}
		{@render algobutton("Monochrome", "monochrome")}
	</div>

	<div class="grid grid-rows-2 grid-cols-6 grid-flow-col-dense rounded-xl overflow-hidden">
		{#each pairs as [bgName, fgName]}
			{@const bgHex = hexFromArgb(MaterialDynamicColors[bgName as Color].getArgb(currentScheme))}
			{@const fgHex = hexFromArgb(MaterialDynamicColors[fgName as Color].getArgb(currentScheme))}

			<div
				class="h-40 p-4 flex flex-col justify-between"
				style:background={bgHex}
				style:color={fgHex}
			>
				<div class="flex flex-row justify-between">
					<div class="flex flex-col">
						<span class="text-xl">{bgName}</span>
						<span>{fgName}</span>
					</div>
					<div class="flex flex-col">
						<span class="text-xl text-end">{bgHex}</span>
						<span class="text-end">{fgHex}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
