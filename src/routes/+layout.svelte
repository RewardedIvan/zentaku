<script>
	import { StyleFromScheme } from "m3-svelte";
	import { scheme } from "$lib/stores/theme";
	import "@fontsource/roboto";
	import "../app.css";

	const { children } = $props();
</script>

<StyleFromScheme {...$scheme} />
{@render children()}
