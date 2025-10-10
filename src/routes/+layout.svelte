<script lang="ts">
	import { Settings } from "$lib/stores/Settings";
	import type { Snippet } from "svelte";
	import { genCSS } from "m3-svelte";

	import "@fontsource/roboto";
	import "@fontsource/afacad-flux";
	import "@fontsource/jetbrains-mono";
	import "../app.pcss";
	import { DynamicScheme, Hct } from "@ktibow/material-color-utilities-nightly";

	const { children }: { children: Snippet } = $props();

	const commonArgs = $derived({
		sourceColorHct: Hct.fromInt($Settings.theme.sourceColor),
		contrastLevel: $Settings.theme.contrast,
		variant: $Settings.theme.variant,
		specVersion: "2025" as any,
	});
	const css = $derived(
		`:root {
			--m3-util-density: ${$Settings.theme.density ?? -2};
		}
		${genCSS(
			new DynamicScheme({ ...commonArgs, isDark: false }),
			new DynamicScheme({ ...commonArgs, isDark: true }),
		)}`,
	);
</script>

{@render children()}

<!-- @html doesnt work because postcss parses it for some reason -->
<svelte:head>
	<svelte:element this={"style"} type="text/css">{css}</svelte:element>
</svelte:head>
