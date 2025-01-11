<script lang="ts">
	import { StyleFromScheme } from "m3-svelte";
	import { scheme } from "$lib/stores/theme";

	import "@fontsource/roboto";
	import "@fontsource/afacad-flux";
	import "@fontsource/jetbrains-mono";
	import "../app.pcss";

	const { children } = $props();
</script>

<StyleFromScheme {...$scheme} />
{@render children()}
