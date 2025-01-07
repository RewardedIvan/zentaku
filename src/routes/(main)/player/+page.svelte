<script lang="ts">
	import Video from "./Video.svelte";
	import { Playing } from "$lib/stores/Player";

	//  title={$Playing.title} description={$Playing.description}
</script>

<Video class="flex-grow">
	<source src="https://sveltejs.github.io/assets/caminandes-llamigos.mp4" type="video/mp4" />
</Video>

<style>
	:global(body) {
		overflow: hidden;
		background: black;
	}
</style>
