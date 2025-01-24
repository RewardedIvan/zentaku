<script lang="ts">
	import { StyleFromScheme } from "m3-svelte";
	import { Settings } from "$lib/stores/Settings";

	import "@fontsource/roboto";
	import "@fontsource/afacad-flux";
	import "@fontsource/jetbrains-mono";
	import "../app.pcss";

	const { children } = $props();
</script>

<StyleFromScheme {...$Settings.theme.serialized} />
{@render children()}
