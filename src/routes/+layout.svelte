<script lang="ts">
	import { Settings } from "$lib/stores/settings";
	import { DynamicScheme, Hct } from "@ktibow/material-color-utilities-nightly";
	import type { Snippet } from "svelte";
	import { genCSS } from "m3-svelte";
	import SettingsMismatchDialog from "./SettingsMismatchDialog.svelte";

	import "@fontsource/roboto";
	import "@fontsource/afacad-flux";
	import "@fontsource/jetbrains-mono";
	import "../app.pcss";

	const { children }: { children: Snippet } = $props();

	let versionMismatchDialogOpen = $state(false);

	let commonArgs = $derived({
		sourceColorHct: Hct.fromInt($Settings.theme.sourceColor),
		contrastLevel: $Settings.theme.contrast,
		variant: $Settings.theme.variant,
		specVersion: "2025" as any,
	});

	let css = $derived(
		(versionMismatchDialogOpen
			? `
				@media (prefers-color-scheme: light) {
					:root {
						color-scheme: light;
					}
					:root, ::backdrop {
						--m3-scheme-background: 255 248 247;
						--m3-scheme-on-background: 60 47 48;
						--m3-scheme-surface: 255 248 247;
						--m3-scheme-surface-dim: 234 213 214;
						--m3-scheme-surface-bright: 255 248 247;
						--m3-scheme-surface-container-lowest: 255 255 255;
						--m3-scheme-surface-container-low: 255 240 240;
						--m3-scheme-surface-container: 254 233 233;
						--m3-scheme-surface-container-high: 249 227 228;
						--m3-scheme-surface-container-highest: 243 222 222;
						--m3-scheme-on-surface: 60 47 48;
						--m3-scheme-on-surface-variant: 107 91 92;
						--m3-scheme-outline: 135 119 119;
						--m3-scheme-outline-variant: 193 173 174;
						--m3-scheme-inverse-surface: 21 12 12;
						--m3-scheme-inverse-on-surface: 171 153 153;
						--m3-scheme-primary: 168 54 74;
						--m3-scheme-primary-dim: 152 42 62;
						--m3-scheme-on-primary: 255 247 247;
						--m3-scheme-primary-container: 252 118 136;
						--m3-scheme-on-primary-container: 78 0 20;
						--m3-scheme-primary-fixed: 252 118 136;
						--m3-scheme-primary-fixed-dim: 235 105 123;
						--m3-scheme-on-primary-fixed: 0 0 0;
						--m3-scheme-on-primary-fixed-variant: 95 0 27;
						--m3-scheme-inverse-primary: 252 118 136;
						--m3-scheme-secondary: 136 78 84;
						--m3-scheme-secondary-dim: 122 67 73;
						--m3-scheme-on-secondary: 255 247 247;
						--m3-scheme-secondary-container: 255 218 220;
						--m3-scheme-on-secondary-container: 121 66 72;
						--m3-scheme-secondary-fixed: 255 218 220;
						--m3-scheme-secondary-fixed-dim: 255 198 202;
						--m3-scheme-on-secondary-fixed: 99 48 54;
						--m3-scheme-on-secondary-fixed-variant: 132 75 81;
						--m3-scheme-tertiary: 145 77 0;
						--m3-scheme-tertiary-dim: 128 67 0;
						--m3-scheme-on-tertiary: 255 247 244;
						--m3-scheme-tertiary-container: 246 155 75;
						--m3-scheme-on-tertiary-container: 77 38 0;
						--m3-scheme-tertiary-fixed: 246 155 75;
						--m3-scheme-tertiary-fixed-dim: 230 142 63;
						--m3-scheme-on-tertiary-fixed: 41 18 0;
						--m3-scheme-on-tertiary-fixed-variant: 90 46 0;
						--m3-scheme-error: 187 27 27;
						--m3-scheme-error-dim: 169 8 16;
						--m3-scheme-on-error: 255 247 246;
						--m3-scheme-error-container: 254 78 68;
						--m3-scheme-on-error-container: 87 0 3;
						--m3-scheme-shadow: 0 0 0;
						--m3-scheme-scrim: 0 0 0;
						--m3-scheme-on-on-primary: 167 54 73;
						--m3-scheme-primary-container-subtle: 255 206 209;
						--m3-scheme-on-primary-container-subtle: 143 35 56;
						--m3-scheme-secondary-container-subtle: 255 206 209;
						--m3-scheme-on-secondary-container-subtle: 115 61 67;
						--m3-scheme-tertiary-container-subtle: 255 209 175;
						--m3-scheme-on-tertiary-container-subtle: 118 62 0;
						--m3-scheme-error-container-subtle: 255 207 201;
						--m3-scheme-on-error-container-subtle: 158 0 11;
					}
				}
				@media (prefers-color-scheme: dark) {
					:root {
						color-scheme: dark;
					}
					:root, ::backdrop {
						--m3-scheme-background: 21 12 12;
						--m3-scheme-on-background: 246 225 225;
						--m3-scheme-surface: 21 12 12;
						--m3-scheme-surface-dim: 21 12 12;
						--m3-scheme-surface-bright: 53 41 42;
						--m3-scheme-surface-container-lowest: 0 0 0;
						--m3-scheme-surface-container-low: 27 17 17;
						--m3-scheme-surface-container: 34 23 24;
						--m3-scheme-surface-container-high: 40 29 29;
						--m3-scheme-surface-container-highest: 47 35 36;
						--m3-scheme-on-surface: 246 225 225;
						--m3-scheme-on-surface-variant: 186 167 167;
						--m3-scheme-outline: 130 113 114;
						--m3-scheme-outline-variant: 83 68 69;
						--m3-scheme-inverse-surface: 255 248 247;
						--m3-scheme-inverse-on-surface: 96 81 82;
						--m3-scheme-primary: 255 140 153;
						--m3-scheme-primary-dim: 252 118 136;
						--m3-scheme-on-primary: 100 0 29;
						--m3-scheme-primary-container: 252 118 136;
						--m3-scheme-on-primary-container: 78 0 20;
						--m3-scheme-primary-fixed: 252 118 136;
						--m3-scheme-primary-fixed-dim: 235 105 123;
						--m3-scheme-on-primary-fixed: 0 0 0;
						--m3-scheme-on-primary-fixed-variant: 95 0 27;
						--m3-scheme-inverse-primary: 168 54 74;
						--m3-scheme-secondary: 253 179 185;
						--m3-scheme-secondary-dim: 238 166 172;
						--m3-scheme-on-secondary: 100 49 55;
						--m3-scheme-secondary-container: 94 44 50;
						--m3-scheme-on-secondary-container: 245 172 178;
						--m3-scheme-secondary-fixed: 255 218 220;
						--m3-scheme-secondary-fixed-dim: 255 198 202;
						--m3-scheme-on-secondary-fixed: 99 48 54;
						--m3-scheme-on-secondary-fixed-variant: 132 75 81;
						--m3-scheme-tertiary: 255 168 93;
						--m3-scheme-tertiary-dim: 243 153 72;
						--m3-scheme-on-tertiary: 89 45 0;
						--m3-scheme-tertiary-container: 243 153 72;
						--m3-scheme-on-tertiary-container: 74 37 0;
						--m3-scheme-tertiary-fixed: 246 155 75;
						--m3-scheme-tertiary-fixed-dim: 230 142 63;
						--m3-scheme-on-tertiary-fixed: 41 18 0;
						--m3-scheme-on-tertiary-fixed-variant: 90 46 0;
						--m3-scheme-error: 255 113 100;
						--m3-scheme-error-dim: 218 52 46;
						--m3-scheme-on-error: 74 0 2;
						--m3-scheme-error-container: 172 12 18;
						--m3-scheme-on-error-container: 255 184 176;
						--m3-scheme-shadow: 0 0 0;
						--m3-scheme-scrim: 0 0 0;
						--m3-scheme-on-on-primary: 255 140 153;
						--m3-scheme-primary-container-subtle: 95 0 27;
						--m3-scheme-on-primary-container-subtle: 255 135 149;
						--m3-scheme-secondary-container-subtle: 76 29 35;
						--m3-scheme-on-secondary-container-subtle: 223 152 158;
						--m3-scheme-tertiary-container-subtle: 71 35 0;
						--m3-scheme-on-tertiary-container-subtle: 240 150 70;
						--m3-scheme-error-container-subtle: 96 0 4;
						--m3-scheme-on-error-container-subtle: 255 137 125;
					}
				}`
			: `:root {
				--m3-util-density: ${$Settings.theme.density ?? -2};
			}
			${genCSS(
				new DynamicScheme({ ...commonArgs, isDark: false }),
				new DynamicScheme({ ...commonArgs, isDark: true }),
			)}`
		)
			.replace(/\n/g, "")
			.replace(/(\t| )+/g, " "),
	);

	if ($Settings.version != Settings.defaultValue.version) {
		versionMismatchDialogOpen = true;
	}
</script>

<SettingsMismatchDialog bind:open={versionMismatchDialogOpen} />

{#if !versionMismatchDialogOpen}
	{@render children()}
{/if}

<!-- @html doesnt work because postcss parses it for some reason -->
<svelte:head>
	<svelte:element this={"style"} type="text/css">{css}</svelte:element>
</svelte:head>
